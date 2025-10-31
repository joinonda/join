import { Component, inject, HostListener, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DataService } from '../services/data.service';
import { Task } from '../interfaces/task-interface';
import { Contact } from '../interfaces/contacts-interfaces';
import { getContactColor, getInitials } from '../utilities/contact.helpfunctions';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class Addtask {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);

  contacts = toSignal(this.dataService.getContacts(), { initialValue: [] });
  selectedContacts = signal<Contact[]>([]);
  isDropdownOpen = signal(false);
  searchTerm = signal('');
  currentUserId = signal('');

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
      status: 'inprogress',
      assignedTo: this.selectedContacts().map(c => `${c.firstName} ${c.lastName}`),
      subtasks: [],
    });

    this.form.reset({ priority: 'medium' });
    this.selectedContacts.set([]);
  }
}
