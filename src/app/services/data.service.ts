import { Injectable, inject } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Observable } from 'rxjs';
import { Interfaces } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private firebaseService = inject(FirebaseService);

  getContacts(): Observable<Interfaces[]> {
    return this.firebaseService.getCollectionSnapshot('contact');
  }
}
