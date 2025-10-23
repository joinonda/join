import { Injectable, inject, runInInjectionContext, Injector } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Interfaces } from '../interfaces/interfaces';

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

  updateDocument(col: string, id: string, data: any): Promise<void> {
    return runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `${col}/${id}`);
      return updateDoc(ref, data);
    });
  }

  deleteDocument(col: string, id: string): Promise<void> {
    return runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `${col}/${id}`);
      return deleteDoc(ref);
    });
  }
}
