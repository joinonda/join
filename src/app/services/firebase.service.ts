import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  docData,
  addDoc,
} from '@angular/fire/firestore';
import { getDoc } from 'firebase/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { Interfaces, NewContact, Task, Subtask } from '../interfaces/contacts-interfaces';
import { Timestamp, serverTimestamp } from 'firebase/firestore';

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
    return runInInjectionContext(this.injector, async () => {
      await updateDoc(doc(this.firestore, 'contact', id), {
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
      });
    });
  }

  async deleteContactFromDatabase(id: string) {
    return runInInjectionContext(this.injector, async () => {
      await deleteDoc(doc(this.firestore, 'contact', id));
    });
  }

  getTasksSnapshot(): Observable<Task[]> {
    return new Observable((observer) =>
      runInInjectionContext(this.injector, () => {
        const ref = collection(this.firestore, 'tasks');
        const unsub = onSnapshot(
          ref,
          (snap) => {
            observer.next(
              snap.docs.map((d) => {
                const x: any = d.data();
                return {
                  id: d.id,
                  ...x,
                  dueDate: x.dueDate?.toDate?.(),
                  createdAt: x.createdAt?.toDate?.(),
                } as Task;
              })
            );
          },
          (err) => observer.error(err)
        );
        return () => unsub();
      })
    );
  }

  async addTaskToDatabase(task: Omit<Task, 'id' | 'createdAt'>) {
    return runInInjectionContext(this.injector, async () => {
      await addDoc(collection(this.firestore, 'tasks'), {
        ...task,
        dueDate: Timestamp.fromDate(task.dueDate),
        createdAt: serverTimestamp(),
      });
    });
  }

  async addSubtask(taskId: string, subtask: Subtask) {
    const ref = doc(this.firestore, 'tasks', taskId);
    const data = await firstValueFrom(docData(ref));
    const current = (data?.['subtasks'] ?? []) as Subtask[];
    await updateDoc(ref, { subtasks: [...current, subtask] });
  }
}
