import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Contact } from '../interfaces/contacts-interfaces';
import { Task, Subtask } from '../interfaces/task-interface';
import { Observable } from 'rxjs';

/**
 * Service for managing contacts and tasks data.
 * Provides methods for CRUD operations on contacts and tasks.
 * Automatically categorizes tasks by status in the constructor.
 */
@Injectable({ providedIn: 'root' })
export class DataService {
  /** FirebaseService for database operations. */
  private firebaseService = inject(FirebaseService);

  /** Array of tasks with 'todo' status. */
  todo: Task[] = [];
  /** Array of tasks with 'inprogress' status. */
  inProgress: Task[] = [];
  /** Array of tasks with 'awaitfeedback' status. */
  awaitFeedback: Task[] = [];
  /** Array of tasks with 'done' status. */
  done: Task[] = [];

  /**
   * Initializes the service and subscribes to task updates.
   * Automatically categorizes tasks by status into respective arrays.
   */
  constructor() {
    this.getTasks().subscribe((tasks) => {
      this.todo = [];
      this.inProgress = [];
      this.awaitFeedback = [];
      this.done = [];
      tasks.forEach((t) => this.categorizeTask(t));
    });
  }

  /**
   * Gets all contacts from the database.
   * @returns Observable emitting an array of contacts.
   */
  getContacts(): Observable<Contact[]> {
    return this.firebaseService.getCollectionSnapshot('contact');
  }

  /**
   * Adds a new contact to the database.
   * @param contact - The contact data without id (id will be generated).
   */
  async addContact(contact: Omit<Contact, 'id'>) {
    await this.firebaseService.addContactToDatabase(contact);
  }

  /**
   * Updates an existing contact in the database.
   * @param id - The unique identifier of the contact to update.
   * @param contact - The complete contact object with updated data.
   */
  async updateContact(id: string, contact: Contact) {
    await this.firebaseService.updateContactInDatabase(id, contact);
  }

  /**
   * Deletes a contact from the database.
   * @param id - The unique identifier of the contact to delete.
   */
  async deleteContact(id: string) {
    await this.firebaseService.deleteContactFromDatabase(id);
  }

  /**
   * Gets all tasks from the database.
   * @returns Observable emitting an array of tasks.
   */
  getTasks(): Observable<Task[]> {
    return this.firebaseService.getTasksSnapshot();
  }

  /**
   * Adds a new task to the database.
   * @param task - The task data without id (id will be generated).
   * @returns Promise resolving when the task is added.
   */
  addTask(task: Omit<Task, 'id'>) {
    return this.firebaseService.addTaskToDatabase(task);
  }

  /**
   * Deletes a task from the database.
   * @param id - The unique identifier of the task to delete.
   * @returns Promise resolving when the task is deleted.
   */
  deleteTask(id: string) {
    return this.firebaseService.deleteTaskFromDatabase(id);
  }

  /**
   * Saves partial updates to a task in the database.
   * @param id - The unique identifier of the task to update.
   * @param partial - Partial task object containing only the fields to update.
   * @returns Promise resolving when the task is updated.
   */
  saveTask(id: string, partial: Partial<Task>) {
    return this.firebaseService.updateTaskInDatabase(id, partial);
  }

  /**
   * Edits a task by saving partial updates (alias for saveTask).
   * @param id - The unique identifier of the task to update.
   * @param partial - Partial task object containing only the fields to update.
   * @returns Promise resolving when the task is updated.
   */
  editTask(id: string, partial: Partial<Task>) {
    return this.saveTask(id, partial);
  }

  /**
   * Categorizes a task into the appropriate status array.
   * @param task - The task to categorize by its status property.
   */
  private categorizeTask(task: Task) {
    if (task.status === 'todo') {
      this.todo.push(task);
    } else if (task.status === 'inprogress') {
      this.inProgress.push(task);
    } else if (task.status === 'awaitfeedback') {
      this.awaitFeedback.push(task);
    } else if (task.status === 'done') {
      this.done.push(task);
    }
  }
}
