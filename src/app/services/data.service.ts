import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Observable } from 'rxjs';
import { Interfaces } from '../interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class DataService {
  private firebaseService = inject(FirebaseService);

  getContacts(): Observable<Interfaces[]> {
    return this.firebaseService.getCollectionSnapshot('contact');
  }

  updateContact(contact: Interfaces) {
    return this.firebaseService.updateDocument('contact', contact.id, contact);
  }
  deleteContact(id: string) {
    return this.firebaseService.deleteDocument('contact', id);
  }

  addContact(contact: Interfaces) {
    return this.firebaseService.addDocument('contact', contact);
  }
}
