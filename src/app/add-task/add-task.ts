import {Component,inject, HostListener,computed,signal,ViewChild,input,output,} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormsModule,FormBuilder,Validators,AbstractControl,ValidationErrors} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { DataService } from '../services/data.service';
import { Task, Subtask } from '../interfaces/task-interface';
import { Contact } from '../interfaces/contacts-interfaces';
import { getContactColor, getInitials } from '../utilities/contact.helpfunctions';
import { ToastComponent } from '../shared/toast/toast';

/**
 * Component for adding new tasks to the board.
 * Handles task creation with form validation, contact assignment, and subtask management.
 * @component
 */
@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ToastComponent],
  templateUrl: './add-task.html',
  styleUrls: ['./add-task.scss', './add-task-mobile.scss'],
})
export class Addtask {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild(ToastComponent) toast!: ToastComponent;

  /** Initial status for the task. Defaults to 'todo'. */
  initialStatus = input<Task['status']>('todo');

  /** Event emitter fired when a task is successfully created. */
  taskCreated = output<void>();

  /**
   * Computed initial status that takes priority from URL query params if valid,
   * otherwise falls back to the input initialStatus.
   * @returns {Task['status']} The effective initial status for the task.
   */
  effectiveInitialStatus = computed<Task['status']>(() => {
    const queryStatus = this.route.snapshot.queryParams['status'];
    if (queryStatus && ['todo', 'inprogress', 'awaitfeedback', 'done'].includes(queryStatus)) {
      return queryStatus as Task['status'];
    }
    return this.initialStatus();
  });

  /** Signal containing all available contacts. */
  contacts = toSignal(this.dataService.getContacts(), { initialValue: [] });

  /** Signal containing the currently selected contacts for task assignment. */
  selectedContacts = signal<Contact[]>([]);

  /** Signal indicating whether the contact dropdown is open. */
  isDropdownOpen = signal(false);

  /** Signal containing the search term for filtering contacts. */
  searchTerm = signal('');

  /** Signal containing the current user's ID. */
  currentUserId = signal('');

  /** Signal containing all subtasks for the current task. */
  subtasks = signal<Subtask[]>([]);

  /** Input value for adding a new subtask. */
  newSubtaskInput = '';

  /** Counter for generating unique subtask IDs. */
  private subtaskIdCounter = 0;

  /** Signal containing the ID of the currently hovered subtask. */
  hoveredSubtaskId = signal<string | null>(null);

  /** Signal containing the ID of the subtask currently being edited. */
  editingSubtaskId = signal<string | null>(null);

  /** Signal containing the title of the subtask being edited. */
  editingSubtaskTitle = signal<string>('');

  /** Reactive form group containing all task form fields. */
  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    dueDate: ['', [Validators.required, this.futureDateValidator]],
    priority: ['medium' as Task['priority']],
    category: ['', Validators.required],
  });

  /** Today's date formatted as YYYY-MM-DD for the date input. */
  todayStr = this.toLocalDateInputString(new Date());

  /**
   * Converts a Date object to a local date string in YYYY-MM-DD format.
   * @param {Date} d - The date to convert.
   * @returns {string} The formatted date string.
   */
  private toLocalDateInputString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Validator function to ensure the selected date is not in the past.
   * @param {AbstractControl} ctrl - The form control to validate.
   * @returns {ValidationErrors | null} Returns { pastDate: true } if date is in the past, null otherwise.
   */
  futureDateValidator(ctrl: AbstractControl): ValidationErrors | null {
    const v = ctrl.value;
    if (!v) return null;
    const d = new Date(v);
    d.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today ? { pastDate: true } : null;
  }

  /**
   * Getter for the title form control.
   * @returns {AbstractControl | null} The title form control.
   */
  get title() {
    return this.form.get('title');
  }

  /**
   * Getter for the dueDate form control.
   * @returns {AbstractControl | null} The dueDate form control.
   */
  get dueDate() {
    return this.form.get('dueDate');
  }

  /**
   * Getter for the category form control.
   * @returns {AbstractControl | null} The category form control.
   */
  get category() {
    return this.form.get('category');
  }

  /**
   * Computed signal that filters contacts based on the search term.
   * Filters by first name or last name (case-insensitive).
   * @returns {Contact[]} Array of filtered contacts matching the search term.
   */
  filteredContacts = computed(() => {
    const contacts = this.contacts() ?? [];
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return contacts;
    return contacts.filter(
      (c) => c.firstName.toLowerCase().includes(term) || c.lastName.toLowerCase().includes(term)
    );
  });

  /**
   * Sets the priority for the task.
   * @param {Task['priority']} priority - The priority level to set (urgent, medium, or low).
   */
  prioritySelect(priority: Task['priority']) {
    this.form.patchValue({ priority });
  }

  /**
   * Toggles the selection state of a contact.
   * Adds the contact if not selected, removes it if already selected.
   * @param {string} contactId - The ID of the contact to toggle.
   */
  toggleContact(contactId: string) {
    const contact = this.contacts()?.find((c) => c.id === contactId);
    if (!contact) return;
    const current = this.selectedContacts();
    const index = current.findIndex((c) => c.id === contactId);
    this.selectedContacts.set(
      index > -1 ? current.filter((c) => c.id !== contactId) : [...current, contact]
    );
  }

  /**
   * Removes a contact from the selected contacts list.
   * @param {string} contactId - The ID of the contact to remove.
   */
  removeContact(contactId: string) {
    this.selectedContacts.set(this.selectedContacts().filter((c) => c.id !== contactId));
  }

  /**
   * Toggles the contact dropdown open/closed state.
   * Clears the search term when closing the dropdown.
   */
  toggleDropdown() {
    this.isDropdownOpen.update((v) => !v);
    if (!this.isDropdownOpen()) this.searchTerm.set('');
  }

  /**
   * Closes the contact dropdown and clears the search term.
   */
  closeDropdown() {
    this.isDropdownOpen.set(false);
    this.searchTerm.set('');
  }

  /**
   * Checks if a contact is currently selected.
   * @param {string} contactId - The ID of the contact to check.
   * @returns {boolean} True if the contact is selected, false otherwise.
   */
  isContactSelected = (contactId: string) =>
    this.selectedContacts().some((c) => c.id === contactId);

  /**
   * Checks if a contact ID matches the current user's ID.
   * @param {string} contactId - The ID of the contact to check.
   * @returns {boolean} True if the contact is the current user, false otherwise.
   */
  isCurrentUser = (contactId: string) => contactId === this.currentUserId();

  /** Function to get the color for a contact's avatar. */
  getContactColor = getContactColor;

  /** Function to get the initials for a contact's avatar. */
  getInitials = getInitials;

  /**
   * Handles document click events to close the dropdown when clicking outside.
   * @param {MouseEvent} event - The click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('.dropdown-container')) this.closeDropdown();
  }

  /**
   * Adds a new subtask to the subtasks list.
   * Creates a new subtask with a unique ID and clears the input field.
   */
  addSubtask() {
    const title = this.newSubtaskInput.trim();
    if (!title) return;
    this.subtasks.update((list) => [
      ...list,
      { id: `subtask-${++this.subtaskIdCounter}`, title, completed: false },
    ]);
    this.newSubtaskInput = '';
  }
  /**
   * Clears the subtask input field.
   */
  clearSubtaskInput() {
    this.newSubtaskInput = '';
  }
  /**
   * Removes a subtask from the subtasks list.
   * @param {string} id - The ID of the subtask to remove.
   */
  removeSubtask(id: string) {
    this.subtasks.update((list) => list.filter((s) => s.id !== id));
  }
  /**
   * Sets the ID of the currently hovered subtask.
   * @param {string | null} id - The ID of the hovered subtask, or null to clear.
   */
  setHoveredSubtask(id: string | null) {
    this.hoveredSubtaskId.set(id);
  }
  /**
   * Starts editing a subtask by setting the editing state and title.
   * @param {Subtask} subtask - The subtask to start editing.
   */
  startEditingSubtask(subtask: Subtask) {
    this.editingSubtaskId.set(subtask.id);
    this.editingSubtaskTitle.set(subtask.title);
  }
  /**
   * Updates the title of the subtask being edited.
   * @param {string} title - The new title for the subtask.
   */
  updateEditingSubtaskTitle(title: string) {
    this.editingSubtaskTitle.set(title);
  }
  /**
   * Cancels editing the current subtask and resets the editing state.
   */
  cancelEditingSubtask() {
    this.editingSubtaskId.set(null);
    this.editingSubtaskTitle.set('');
  }
  /**
   * Saves the edited subtask. If the title is empty, removes the subtask instead.
   * @param {string} subtaskId - The ID of the subtask being edited.
   */
  saveSubtaskEdit(subtaskId: string) {
    const title = this.editingSubtaskTitle().trim();
    if (!title) {
      this.removeSubtask(subtaskId);
      this.stopEditingSubtask();
      return;
    }
    this.updateSubtaskTitle(subtaskId, title);
    this.stopEditingSubtask();
  }

  /**
   * Stops editing the current subtask and clears the editing state.
   * @private
   */
  private stopEditingSubtask() {
    this.editingSubtaskId.set(null);
    this.editingSubtaskTitle.set('');
  }

  /**
   * Updates the title of a specific subtask in the list.
   * @private
   * @param {string} subtaskId - The ID of the subtask to update.
   * @param {string} title - The new title for the subtask.
   */
  private updateSubtaskTitle(subtaskId: string, title: string) {
    this.subtasks.update((list) => list.map((s) => (s.id === subtaskId ? { ...s, title } : s)));
  }

  /**
   * Clears all form fields and resets the component state.
   * Resets form, contacts, and subtasks to their initial state.
   */
  clearForm() {
    this.resetForm();
    this.resetContacts();
    this.resetSubtasks();
  }

  /**
   * Resets the form to its initial state with default priority.
   */
  private resetForm() {
    this.form.reset({ priority: 'medium' });
  }

  /**
   * Resets the selected contacts list to empty.
   */
  private resetContacts() {
    this.selectedContacts.set([]);
  }

  /**
   * Resets all subtask-related state to initial values.
   */
  private resetSubtasks() {
    this.subtasks.set([]);
    this.newSubtaskInput = '';
    this.subtaskIdCounter = 0;
    this.hoveredSubtaskId.set(null);
    this.editingSubtaskId.set(null);
    this.editingSubtaskTitle.set('');
  }

  /**
   * Creates a new task with the current form data.
   * Validates the form, saves the task, shows a success toast, and clears the form.
   */
  async createTask() {
    if (!this.isFormValid()) return;

    await this.saveTask();
    this.showSuccessToast();
    this.clearForm();
  }

  /**
   * Validates the form and marks all fields as touched if invalid.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  private isFormValid(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }
    return true;
  }

  /**
   * Saves the task to the data service.
   */
  private async saveTask() {
    await this.dataService.addTask(this.buildTaskData());
  }

  /**
   * Builds the task data object from form values and component state.
   * @returns {Partial<Task>} The task data object ready to be saved.
   */
  private buildTaskData() {
    return {
      title: this.form.value.title!,
      description: this.form.value.description ?? '',
      dueDate: new Date(this.form.value.dueDate as string),
      priority: (this.form.value.priority ?? 'medium') as Task['priority'],
      category: this.form.value.category!,
      status: this.effectiveInitialStatus(),
      assignedTo: this.getAssignedToNames(),
      subtasks: this.subtasks(),
    };
  }

  /**
   * Extracts full names from selected contacts.
   * @returns {string[]} Array of full names (firstName + lastName) for selected contacts.
   */
  private getAssignedToNames(): string[] {
    return this.selectedContacts().map((c) => `${c.firstName} ${c.lastName}`);
  }

  /**
   * Shows a success toast message and handles navigation after task creation.
   */
  private showSuccessToast() {
    this.toast.show('Task added to board', 2000);
    this.toast.closed$.pipe(take(1)).subscribe(() => {
      this.handleTaskCreated();
    });
  }

  /**
   * Handles post-task-creation actions: emits event and navigates to board if needed.
   */
  private handleTaskCreated() {
    this.taskCreated.emit();
    if (this.router.url !== '/board') this.router.navigate(['/board']);
  }
}
