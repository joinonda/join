import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Contact } from '../interfaces/contacts-interfaces';
import { Task, Subtask } from '../interfaces/task-interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private firebaseService = inject(FirebaseService);

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

  async addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    await this.firebaseService.addTaskToDatabase(task);
  }
}
