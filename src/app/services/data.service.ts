import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Contact } from '../interfaces/contacts-interfaces';
import { Task, Subtask } from '../interfaces/task-interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private firebaseService = inject(FirebaseService);

  todo: Task[] = [];
  inProgress: Task[] = [];
  awaitFeedback: Task[] = [];
  done: Task[] = [];

  constructor() {
    this.getTasks().subscribe((tasks) => {
      this.todo = [];
      this.inProgress = [];
      this.awaitFeedback = [];
      this.done = [];
      tasks.forEach((t) => this.categorizeTask(t));
    });
  }

  getContacts(): Observable<Contact[]> {
    return this.firebaseService.getCollectionSnapshot('contact');
  }

  async addContact(contact: Omit<Contact, 'id'>) {
    await this.firebaseService.addContactToDatabase(contact);
  }

  async updateContact(id: string, contact: Contact) {
    await this.firebaseService.updateContactInDatabase(id, contact);
  }

  async deleteContact(id: string) {
    await this.firebaseService.deleteContactFromDatabase(id);
  }

  getTasks(): Observable<Task[]> {
    return this.firebaseService.getTasksSnapshot();
  }

  addTask(task: Omit<Task, 'id'>) {
    return this.firebaseService.addTaskToDatabase(task);
  }

  deleteTask(id: string) {
    return this.firebaseService.deleteTaskFromDatabase(id);
  }

  saveTask(id: string, partial: Partial<Task>) {
    return this.firebaseService.updateTaskInDatabase(id, partial);
  }

  editTask(id: string, partial: Partial<Task>) {
    return this.saveTask(id, partial);
  }

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
