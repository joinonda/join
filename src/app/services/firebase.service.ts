import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import { Firestore, collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Interfaces, NewContact } from '../interfaces/interfaces';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  getCollectionSnapshot(collectionName: string): Observable<Interfaces[]> {
    return new Observable((observer) => {
      return runInInjectionContext(this.injector, () => {
        const collectionRef = collection(this.firestore, collectionName);
        const unsubscribe = onSnapshot(
          collectionRef,
          (snapshot) => {
            const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Interfaces));
            observer.next(data);
          },
          (error) => observer.error(error)
        );
        return () => unsubscribe();
      });
    });
  }

  async addContactToDatabase(contact: Omit<Interfaces, 'id'>) {
    return runInInjectionContext(this.injector, async () => {
      return await addDoc(collection(this.firestore, 'contact'), contact);
    });
  }
 
  async updateContactInDatabase(id: string, contact: Interfaces) {
    await updateDoc(doc(this.firestore, 'contact', id), {
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone
    });
  }

  async deleteContactFromDatabase(id: string) {
    await deleteDoc(doc(this.firestore, 'contact', id));
  }
}
