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
import { Contact, NewContact } from '../interfaces/contacts-interfaces';
import { Task, Subtask } from '../interfaces/task-interface';
import { Timestamp } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  getCollectionSnapshot(collectionName: string): Observable<Contact[]> {
    return new Observable((observer) => {
      return runInInjectionContext(this.injector, () => {
        const collectionRef = collection(this.firestore, collectionName);
        const unsubscribe = onSnapshot(
          collectionRef,
          (snapshot) => {
            const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Contact));
            observer.next(data);
          },
          (error) => observer.error(error)
        );
        return () => unsubscribe();
      });
    });
  }

  async addContactToDatabase(contact: Omit<Contact, 'id'>) {
    return runInInjectionContext(this.injector, async () => {
      return await addDoc(collection(this.firestore, 'contact'), contact);
    });
  }

  async updateContactInDatabase(id: string, contact: Contact) {
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
      if (!id) {
        throw new Error('Contact ID is required for deletion');
      }
      const docRef = doc(this.firestore, 'contact', id);
      await deleteDoc(docRef);
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

  async addTaskToDatabase(task: Omit<Task, 'id'>) {
    return runInInjectionContext(this.injector, async () => {
      await addDoc(collection(this.firestore, 'tasks'), {
        ...task,
        dueDate: task.dueDate,
      });
    });
  }

  async addSubtask(taskId: string, subtask: Subtask) {
    const ref = doc(this.firestore, 'tasks', taskId);
    const data = await firstValueFrom(docData(ref));
    const current = (data?.['subtasks'] ?? []) as Subtask[];
    await updateDoc(ref, { subtasks: [...current, subtask] });
  }

  async deleteTaskFromDatabase(id: string) {
    return runInInjectionContext(this.injector, async () => {
      await deleteDoc(doc(this.firestore, 'tasks', id));
    });
  }

  async updateTaskInDatabase(id: string, partial: Partial<Task>) {
    return runInInjectionContext(this.injector, async () => {
      const payload: any = { ...partial };
      if (payload.dueDate instanceof Date) {
        payload.dueDate = payload.dueDate;
      }
      await updateDoc(doc(this.firestore, 'tasks', id), payload);
    });
  }

  async updateTask(id: string, partial: Partial<Task>) {
    const ref = doc(this.firestore, 'tasks', id);
    return updateDoc(ref, partial);
  }
}
