import { Component, output, inject, computed, effect, input, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Task, Subtask } from '../../../interfaces/task-interface';
import { Contact } from '../../../interfaces/contacts-interfaces';
import { DataService } from '../../../services/data.service';
import { getContactColor, findContactByName, getInitials } from '../../../utilities/contact.helpfunctions';

/**
 * Component for editing tasks in a dialog.
 * Handles task editing, contact assignment, subtask management, and form validation.
 */
@Component({
  selector: 'app-board-task-dialog-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './board-task-dialog-edit.html',
  styleUrls: ['./board-task-dialog-edit.scss', './board-task-dialog-edit-mobile.scss']
})
export class BoardTaskDialogEdit {
  /** Required input signal for the task to edit. */
  task = input.required<Task>();
  /** Output event emitter for when the task is saved. */
  saved = output<Task>();
  /** Output event emitter for when editing is cancelled. */
  cancelled = output<void>();
  
  /** FormBuilder service for creating reactive forms. */
  private fb = inject(FormBuilder);
  /** DataService for saving tasks and retrieving contacts. */
  private dataService = inject(DataService);
  /** Signal containing the list of contacts from the data service. */
  contacts = toSignal(this.dataService.getContacts(), { initialValue: [] });
  
  /** Signal containing the list of selected contacts for the task. */
  selectedContacts = signal<Contact[]>([]);
  /** Signal indicating if the contact dropdown is open. */
  isDropdownOpen = signal(false);
  /** Signal containing the search term for filtering contacts. */
  searchTerm = signal('');
  /** Signal containing the current user ID. */
  currentUserId = signal('');
  /** Signal containing the list of subtasks. */
  subtasks = signal<Subtask[]>([]);
  /** Input value for adding new subtasks. */
  newSubtaskInput = '';
  /** Counter for generating unique subtask IDs. */
  private subtaskIdCounter = 0;
  /** Signal containing the ID of the currently hovered subtask. */
  hoveredSubtaskId = signal<string | null>(null);
  /** Signal containing the ID of the subtask currently being edited. */
  editingSubtaskId = signal<string | null>(null);
  /** Signal containing the title of the subtask being edited. */
  editingSubtaskTitle = signal<string>('');

  /** Reactive form group for task editing. */
  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    dueDate: ['', Validators.required],
    priority: ['medium' as Task['priority']],
    category: ['', Validators.required],
  });

  /**
   * Initializes the component and sets up an effect to update the form when the task input changes.
   */
  constructor() {
    effect(() => {
      const t = this.task();
      if (t) {
        this.patchFormWithTask(t);
        this.setAssignedContacts(t);
        this.initializeSubtasks(t);
      }
    });
  }

  /**
   * Patches the form with values from the task.
   * @param t - The task to extract values from.
   */
  private patchFormWithTask(t: Task): void {
    this.form.patchValue({
      title: t.title,
      description: t.description,
      dueDate: new Date(t.dueDate).toISOString().slice(0, 10),
      priority: t.priority,
      category: t.category,
    });
  }

  /**
   * Sets the assigned contacts based on the task's assignedTo array.
   * @param t - The task to extract assigned contacts from.
   */
  private setAssignedContacts(t: Task): void {
    const contactList = this.contacts() ?? [];
    const assignedContacts = t.assignedTo
      .map(name => findContactByName(name, contactList))
      .filter(Boolean) as Contact[];
    this.selectedContacts.set(assignedContacts);
  }

  /**
   * Initializes the subtasks list and updates the ID counter.
   * @param t - The task to extract subtasks from.
   */
  private initializeSubtasks(t: Task): void {
    this.subtasks.set([...t.subtasks]);
    this.updateSubtaskIdCounter(t.subtasks);
  }

  /**
   * Updates the subtask ID counter based on existing subtask IDs.
   * @param subtasks - Array of subtasks to analyze for ID extraction.
   */
  private updateSubtaskIdCounter(subtasks: Subtask[]): void {
    if (subtasks.length > 0) {
      this.subtaskIdCounter = Math.max(
        ...subtasks.map(s => {
          const match = s.id.match(/\d+$/);
          return match ? parseInt(match[0]) : 0;
        }),
        0
      );
    } else {
      this.subtaskIdCounter = 0;
    }
  }

  /**
   * Computed signal returning filtered contacts based on the search term.
   * @returns Array of contacts matching the search term.
   */
  filteredContacts = computed(() => {
    const contacts = this.contacts() ?? [];
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return contacts;
    return contacts.filter(c => 
      c.firstName.toLowerCase().includes(term) || 
      c.lastName.toLowerCase().includes(term)
    );
  });

  /**
   * Sets the priority value in the form.
   * @param priority - The priority value to set.
   */
  prioritySelect(priority: Task['priority']) {
    this.form.patchValue({ priority });
  }

  /**
   * Toggles a contact's selection state.
   * Adds the contact if not selected, removes it if already selected.
   * @param contactId - The ID of the contact to toggle.
   */
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

  /**
   * Removes a contact from the selected contacts list.
   * @param contactId - The ID of the contact to remove.
   */
  removeContact(contactId: string) {
    this.selectedContacts.set(this.selectedContacts().filter(c => c.id !== contactId));
  }

  /**
   * Toggles the dropdown open/closed state and clears search term when closing.
   */
  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
    if (!this.isDropdownOpen()) this.searchTerm.set('');
  }

  /**
   * Closes the dropdown and clears the search term.
   */
  closeDropdown() {
    this.isDropdownOpen.set(false);
    this.searchTerm.set('');
  }

  /**
   * Checks if a contact is currently selected.
   * @param contactId - The ID of the contact to check.
   * @returns True if the contact is selected, false otherwise.
   */
  isContactSelected = (contactId: string) => 
    this.selectedContacts().some(c => c.id === contactId);

  /**
   * Checks if a contact ID matches the current user ID.
   * @param contactId - The contact ID to check.
   * @returns True if the contact is the current user, false otherwise.
   */
  isCurrentUser = (contactId: string) => contactId === this.currentUserId();

  /** Function reference to get contact color. */
  getContactColor = getContactColor;
  /** Function reference to get contact initials. */
  getInitials = getInitials;

  /**
   * Handles document click events to close the dropdown when clicking outside.
   * @param event - The mouse event from the document click.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.dropdown-container')) {
      this.closeDropdown();
    }
  }

  /**
   * Adds a new subtask to the list if the input is not empty.
   */
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

  /**
   * Clears the subtask input field.
   */
  clearSubtaskInput() {
    this.newSubtaskInput = '';
  }

  /**
   * Removes a subtask from the list.
   * @param id - The ID of the subtask to remove.
   */
  removeSubtask(id: string) {
    this.subtasks.update(list => list.filter(s => s.id !== id));
  }

  /**
   * Sets the hovered subtask ID.
   * @param id - The ID of the subtask being hovered, or null if none.
   */
  setHoveredSubtask(id: string | null) {
    this.hoveredSubtaskId.set(id);
  }

  /**
   * Starts editing a subtask by setting the editing state and title.
   * @param subtask - The subtask to start editing.
   */
  startEditingSubtask(subtask: Subtask) {
    this.editingSubtaskId.set(subtask.id);
    this.editingSubtaskTitle.set(subtask.title);
  }

  /**
   * Updates the title of the subtask being edited.
   * @param title - The new title value.
   */
  updateEditingSubtaskTitle(title: string) {
    this.editingSubtaskTitle.set(title);
  }

  /**
   * Cancels editing a subtask and resets the editing state.
   */
  cancelEditingSubtask() {
    this.editingSubtaskId.set(null);
    this.editingSubtaskTitle.set('');
  }

  /**
   * Saves the edited subtask with the new title.
   * Removes the subtask if the title is empty.
   * @param subtaskId - The ID of the subtask being edited.
   */
  saveSubtaskEdit(subtaskId: string) {
    const title = this.editingSubtaskTitle().trim();
    if (!title) {
      this.removeSubtaskIfEmpty(subtaskId);
      return;
    }
    this.updateSubtaskTitle(subtaskId, title);
    this.stopEditingSubtask();
  }

  /**
   * Removes a subtask if its title is empty after editing.
   * @param subtaskId - The ID of the subtask to remove.
   */
  private removeSubtaskIfEmpty(subtaskId: string): void {
    this.removeSubtask(subtaskId);
    this.editingSubtaskId.set(null);
  }

  /**
   * Updates the title of a subtask in the list.
   * @param subtaskId - The ID of the subtask to update.
   * @param title - The new title for the subtask.
   */
  private updateSubtaskTitle(subtaskId: string, title: string): void {
    this.subtasks.update(list =>
      list.map(s => s.id === subtaskId ? { ...s, title } : s)
    );
  }

  /**
   * Stops editing a subtask and resets the editing state.
   */
  private stopEditingSubtask(): void {
    this.editingSubtaskId.set(null);
    this.editingSubtaskTitle.set('');
  }

  /**
   * Cancels the edit operation and emits the cancelled event.
   */
  cancelEdit() {
    this.cancelled.emit();
    this.closeDropdown();
  }

  /**
   * Saves the edited task to the database and emits the saved event.
   * Validates the form before saving.
   */
  async saveTask() {
    const t = this.task();
    if (!t?.id || !this.isFormValid()) return;

    const taskData = this.buildTaskData();
    await this.dataService.saveTask(t.id, taskData);
    
    const updatedTask = this.createUpdatedTask(t, taskData);
    this.saved.emit(updatedTask);
    this.closeDropdown();
  }

  /**
   * Validates the form and marks all fields as touched if invalid.
   * @returns True if the form is valid, false otherwise.
   */
  private isFormValid(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }
    return true;
  }

  /**
   * Builds the task data object from the form values.
   * @returns Object containing all task data for saving.
   */
  private buildTaskData() {
    return {
      title: this.form.value.title!,
      description: this.form.value.description ?? '',
      dueDate: new Date(this.form.value.dueDate as string),
      priority: (this.form.value.priority ?? 'medium') as Task['priority'],
      category: this.form.value.category!,
      assignedTo: this.getAssignedToNames(),
      subtasks: this.subtasks(),
    };
  }

  /**
   * Converts selected contacts to an array of full names.
   * @returns Array of contact names in "FirstName LastName" format.
   */
  private getAssignedToNames(): string[] {
    return this.selectedContacts().map(c => `${c.firstName} ${c.lastName}`);
  }

  /**
   * Creates an updated task object by merging the original task with new data.
   * @param originalTask - The original task object.
   * @param taskData - The new task data to merge.
   * @returns The updated task object.
   */
  private createUpdatedTask(originalTask: Task, taskData: any): Task {
    return {
      ...originalTask,
      ...taskData,
    };
  }
}