import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Interfaces } from '../interfaces/interfaces';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private firebaseService = inject(FirebaseService);

  getContacts(): Observable<Interfaces[]> {
    return this.firebaseService.getCollectionSnapshot('contact');
  }

  async addContact(contact: Omit<Interfaces, 'id'>) {
    await this.firebaseService.addContactToDatabase(contact);
  }

  async updateContact(id: string, contact: Interfaces) {
    await this.firebaseService.updateContactInDatabase(id, contact);
  }

  async deleteContact(id: string) {
    await this.firebaseService.deleteContactFromDatabase(id);
  }
}
