import { Component, inject, HostListener, computed, signal, ViewChild, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { DataService } from '../services/data.service';
import { Task, Subtask } from '../interfaces/task-interface';
import { Contact } from '../interfaces/contacts-interfaces';
import { getContactColor, getInitials } from '../utilities/contact.helpfunctions';
import { ToastComponent } from '../shared/toast/toast';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToastComponent],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class Addtask {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private router = inject(Router);

  @ViewChild(ToastComponent) toast!: ToastComponent;

  initialStatus = input<Task['status']>('inprogress');
  taskCreated = output<void>();

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

  clearForm() {
    this.form.reset({ priority: 'medium' });
    this.selectedContacts.set([]);
    this.subtasks.set([]);
    this.newSubtaskInput = '';
    this.subtaskIdCounter = 0;
    this.hoveredSubtaskId.set(null);
    this.editingSubtaskId.set(null);
    this.editingSubtaskTitle.set('');
  }

  async createTask() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    await this.dataService.addTask({
      title: this.form.value.title!,
      description: this.form.value.description ?? '',
      dueDate: new Date(this.form.value.dueDate as string),
      priority: (this.form.value.priority ?? 'medium') as Task['priority'],
      category: this.form.value.category!,
      status: this.initialStatus(),
      assignedTo: this.selectedContacts().map(c => `${c.firstName} ${c.lastName}`),
      subtasks: this.subtasks(),
    });

    this.toast.show('Task added to board', 2000);
    
    this.toast.closed$.pipe(take(1)).subscribe(() => {
      this.taskCreated.emit();
      if (this.router.url !== '/board') {
        this.router.navigate(['/board']);
      }
    });

    this.form.reset({ priority: 'medium' });
    this.selectedContacts.set([]);
    this.subtasks.set([]);
    this.newSubtaskInput = '';
    this.subtaskIdCounter = 0;
    this.hoveredSubtaskId.set(null);
    this.editingSubtaskId.set(null);
    this.editingSubtaskTitle.set('');
  }
}
