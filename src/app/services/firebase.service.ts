import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import { Firestore, collection, onSnapshot, doc, updateDoc, deleteDoc, docData, addDoc } from '@angular/fire/firestore';
import { getDoc } from 'firebase/firestore';
import { Observable, firstValueFrom } from 'rxjs';
import { Contact, NewContact } from '../interfaces/contacts-interfaces';
import { Task, Subtask } from '../interfaces/task-interface';
import { Timestamp } from 'firebase/firestore';

/**
 * Service for Firebase Firestore database operations.
 * Handles CRUD operations for contacts and tasks with real-time snapshot listeners.
 * All Firebase operations run within Angular's injection context.
 */
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  /** Firestore instance for database operations. */
  private firestore = inject(Firestore);
  /** Injector for running Firebase operations in injection context. */
  private injector = inject(Injector);

  /**
   * Gets a real-time snapshot of a collection as an Observable.
   * @param collectionName - The name of the Firestore collection.
   * @returns Observable emitting an array of contacts whenever the collection changes.
   */
  getCollectionSnapshot(collectionName: string): Observable<Contact[]> {
    return new Observable((observer) => {
      return runInInjectionContext(this.injector, () => {
        const collectionRef = this.getCollectionRef(collectionName);
        return this.setupCollectionListener(collectionRef, observer);
      });
    });
  }

  /**
   * Gets a reference to a Firestore collection.
   * @param collectionName - The name of the collection.
   * @returns The Firestore collection reference.
   */
  private getCollectionRef(collectionName: string) {
    return collection(this.firestore, collectionName);
  }

  /**
   * Sets up a real-time listener for a collection snapshot.
   * @param collectionRef - The Firestore collection reference.
   * @param observer - The Observable observer to emit data to.
   * @returns Unsubscribe function to stop listening.
   */
  private setupCollectionListener(collectionRef: any, observer: any) {
    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot: any) => {
        const data = this.mapSnapshotToContacts(snapshot);
        observer.next(data);
      },
      (error: any) => observer.error(error)
    );
    return () => unsubscribe();
  }

  /**
   * Maps Firestore snapshot documents to Contact objects.
   * @param snapshot - The Firestore query snapshot.
   * @returns Array of Contact objects with id included.
   */
  private mapSnapshotToContacts(snapshot: any): Contact[] {
    return snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Contact));
  }

  /**
   * Adds a new contact to the Firestore database.
   * @param contact - The contact data without id (id will be auto-generated).
   * @returns Promise resolving to the document reference.
   */
  async addContactToDatabase(contact: Omit<Contact, 'id'>) {
    return runInInjectionContext(this.injector, async () => {
      return await addDoc(collection(this.firestore, 'contact'), contact);
    });
  }

  /**
   * Updates an existing contact in the Firestore database.
   * @param id - The unique identifier of the contact document.
   * @param contact - The complete contact object with updated data.
   */
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

  /**
   * Deletes a contact from the Firestore database.
   * @param id - The unique identifier of the contact to delete.
   * @throws Error if id is not provided.
   */
  async deleteContactFromDatabase(id: string) {
    return runInInjectionContext(this.injector, async () => {
      if (!id) {
        throw new Error('Contact ID is required for deletion');
      }
      const docRef = doc(this.firestore, 'contact', id);
      await deleteDoc(docRef);
    });
  }

  /**
   * Gets a real-time snapshot of tasks collection as an Observable.
   * Converts Firestore Timestamps to JavaScript Date objects.
   * @returns Observable emitting an array of tasks whenever the collection changes.
   */
  getTasksSnapshot(): Observable<Task[]> {
    return new Observable((observer) =>
      runInInjectionContext(this.injector, () => {
        const ref = this.getTasksCollectionRef();
        return this.setupTasksListener(ref, observer);
      })
    );
  }

  /** Gets a reference to the tasks Firestore collection. */
  private getTasksCollectionRef() {
    return collection(this.firestore, 'tasks');
  }

  /**
   * Sets up a real-time listener for tasks collection snapshot.
   * @param ref - The Firestore collection reference.
   * @param observer - The Observable observer to emit data to.
   * @returns Unsubscribe function to stop listening.
   */
  private setupTasksListener(ref: any, observer: any) {
    const unsub = onSnapshot(
      ref,
      (snap: any) => {
        const tasks = this.mapSnapshotToTasks(snap);
        observer.next(tasks);
      },
      (err: any) => observer.error(err)
    );
    return () => unsub();
  }

  /**
   * Maps Firestore snapshot documents to Task objects.
   * Converts Firestore Timestamps to JavaScript Date objects for dueDate.
   * @param snap - The Firestore query snapshot.
   * @returns Array of Task objects with id and converted dates.
   */
  private mapSnapshotToTasks(snap: any): Task[] {
    return snap.docs.map((d: any) => {
      const x: any = d.data();
      return {
        id: d.id,
        ...x,
        dueDate: x.dueDate?.toDate?.(),
      } as Task;
    });
  }

  /**
   * Adds a new task to the Firestore database.
   * @param task - The task data without id (id will be auto-generated).
   */
  async addTaskToDatabase(task: Omit<Task, 'id'>) {
    return runInInjectionContext(this.injector, async () => {
      await addDoc(collection(this.firestore, 'tasks'), {
        ...task,
        dueDate: task.dueDate,
      });
    });
  }

  /**
   * Adds a subtask to an existing task in the database.
   * Retrieves current subtasks and appends the new one.
   * @param taskId - The unique identifier of the task.
   * @param subtask - The subtask to add.
   */
  async addSubtask(taskId: string, subtask: Subtask) {
    const ref = doc(this.firestore, 'tasks', taskId);
    const data = await firstValueFrom(docData(ref));
    const current = (data?.['subtasks'] ?? []) as Subtask[];
    await updateDoc(ref, { subtasks: [...current, subtask] });
  }

  /**
   * Deletes a task from the Firestore database.
   * @param id - The unique identifier of the task to delete.
   */
  async deleteTaskFromDatabase(id: string) {
    return runInInjectionContext(this.injector, async () => {
      await deleteDoc(doc(this.firestore, 'tasks', id));
    });
  }

  /**
   * Updates a task in the Firestore database with partial data.
   * @param id - The unique identifier of the task to update.
   * @param partial - Partial task object containing only the fields to update.
   */
  async updateTaskInDatabase(id: string, partial: Partial<Task>) {
    return runInInjectionContext(this.injector, async () => {
      const payload: any = { ...partial };
      if (payload.dueDate instanceof Date) {
        payload.dueDate = payload.dueDate;
      }
      await updateDoc(doc(this.firestore, 'tasks', id), payload);
    });
  }

  /**
   * Updates a task directly without injection context wrapper.
   * @param id - The unique identifier of the task to update.
   * @param partial - Partial task object containing only the fields to update.
   * @returns Promise resolving when the update is complete.
   */
  async updateTask(id: string, partial: Partial<Task>) {
    const ref = doc(this.firestore, 'tasks', id);
    return updateDoc(ref, partial);
  }
}
