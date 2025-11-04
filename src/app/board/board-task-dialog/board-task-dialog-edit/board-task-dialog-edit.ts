import { Component, output, inject, computed, effect, input, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task, Subtask } from '../../../interfaces/task-interface';
import { Contact } from '../../../interfaces/contacts-interfaces';
import { DataService } from '../../../services/data.service';
import { getContactColor, findContactByName, getInitials } from '../../../utilities/contact.helpfunctions';

@Component({
  selector: 'app-board-task-dialog-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './board-task-dialog-edit.html',
  styleUrl: './board-task-dialog-edit.scss'
})
export class BoardTaskDialogEdit {
  task = input.required<Task>();
  saved = output<Task>();
  cancelled = output<void>();
  
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  contacts = toSignal(this.dataService.getContacts(), { initialValue: [] });
  
  selectedContacts = signal<Contact[]>([]);
  isDropdownOpen = signal(false);
  searchTerm = signal('');
  currentUserId = signal('');
  subtasks = signal<Subtask[]>([]);
  newSubtaskInput = '';
  private subtaskIdCounter = 0;
  hoveredSubtaskId = signal<string | null>(null);
  editingSubtaskId = signal<string | null>(null);
  editingSubtaskTitle = signal<string>('');

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    dueDate: ['', Validators.required],
    priority: ['medium' as Task['priority']],
    category: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const t = this.task();
      if (t) {
        this.form.patchValue({
          title: t.title,
          description: t.description,
          dueDate: new Date(t.dueDate).toISOString().slice(0, 10),
          priority: t.priority,
          category: t.category,
        });
        
        const contactList = this.contacts() ?? [];
        const assignedContacts = t.assignedTo.map(name => {
          const contact = findContactByName(name, contactList);
          return contact;
        }).filter(Boolean) as Contact[];
        this.selectedContacts.set(assignedContacts);

        this.subtasks.set([...t.subtasks]);
        if (t.subtasks.length > 0) {
          this.subtaskIdCounter = Math.max(...t.subtasks.map(s => {
            const match = s.id.match(/\d+$/);
            return match ? parseInt(match[0]) : 0;
          }), 0);
        } else {
          this.subtaskIdCounter = 0;
        }
      }
    });
  }

  filteredContacts = computed(() => {
    const contacts = this.contacts() ?? [];
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return contacts;
    return contacts.filter(c => 
      c.firstName.toLowerCase().includes(term) || 
      c.lastName.toLowerCase().includes(term)
    );
  });

  prioritySelect(priority: Task['priority']) {
    this.form.patchValue({ priority });
  }

  toggleContact(contactId: string) {
    const contact = this.contacts()?.find(c => c.id === contactId);
    if (!contact) return;
    const current = this.selectedContacts();
    const index = current.findIndex(c => c.id === contactId);
    this.selectedContacts.set(index > -1 
      ? current.filter(c => c.id !== contactId)
      : [...current, contact]
    );
  }

  removeContact(contactId: string) {
    this.selectedContacts.set(this.selectedContacts().filter(c => c.id !== contactId));
  }

  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
    if (!this.isDropdownOpen()) this.searchTerm.set('');
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
    this.searchTerm.set('');
  }

  isContactSelected = (contactId: string) => 
    this.selectedContacts().some(c => c.id === contactId);

  isCurrentUser = (contactId: string) => contactId === this.currentUserId();

  getContactColor = getContactColor;
  getInitials = getInitials;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.dropdown-container')) {
      this.closeDropdown();
    }
  }

  addSubtask() {
    const title = this.newSubtaskInput.trim();
    if (!title) return;
    this.subtasks.update(list => [...list, {
      id: `subtask-${++this.subtaskIdCounter}`,
      title,
      completed: false
    }]);
    this.newSubtaskInput = '';
  }

  clearSubtaskInput() {
    this.newSubtaskInput = '';
  }

  removeSubtask(id: string) {
    this.subtasks.update(list => list.filter(s => s.id !== id));
  }

  setHoveredSubtask(id: string | null) {
    this.hoveredSubtaskId.set(id);
  }

  startEditingSubtask(subtask: Subtask) {
    this.editingSubtaskId.set(subtask.id);
    this.editingSubtaskTitle.set(subtask.title);
  }

  updateEditingSubtaskTitle(title: string) {
    this.editingSubtaskTitle.set(title);
  }

  cancelEditingSubtask() {
    this.editingSubtaskId.set(null);
    this.editingSubtaskTitle.set('');
  }

  saveSubtaskEdit(subtaskId: string) {
    const title = this.editingSubtaskTitle().trim();
    if (!title) {
      this.removeSubtask(subtaskId);
      this.editingSubtaskId.set(null);
      return;
    }

    this.subtasks.update(list => 
      list.map(s => s.id === subtaskId ? { ...s, title } : s)
    );
    
    this.editingSubtaskId.set(null);
    this.editingSubtaskTitle.set('');
  }

  cancelEdit() {
    this.cancelled.emit();
    this.isDropdownOpen.set(false);
    this.searchTerm.set('');
  }

  async saveTask() {
    const t = this.task();
    if (!t?.id) return;
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    await this.dataService.saveTask(t.id, {
      title: this.form.value.title!,
      description: this.form.value.description ?? '',
      dueDate: new Date(this.form.value.dueDate as string),
      priority: (this.form.value.priority ?? 'medium') as Task['priority'],
      category: this.form.value.category!,
      assignedTo: this.selectedContacts().map(c => `${c.firstName} ${c.lastName}`),
      subtasks: this.subtasks(),
    });
    
    const updatedTask: Task = {
      ...t,
      title: this.form.value.title!,
      description: this.form.value.description ?? '',
      dueDate: new Date(this.form.value.dueDate as string),
      priority: (this.form.value.priority ?? 'medium') as Task['priority'],
      category: this.form.value.category!,
      assignedTo: this.selectedContacts().map(c => `${c.firstName} ${c.lastName}`),
      subtasks: this.subtasks(),
    };
    this.saved.emit(updatedTask);
    
    this.isDropdownOpen.set(false);
    this.searchTerm.set('');
  }
}

