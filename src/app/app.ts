import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { DataService } from './services/data.service';
import { Subscription } from 'rxjs';
import { Interfaces } from './interfaces/interfaces';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private subscriptions: Subscription[] = [];
  
  contacts: Interfaces[] = [];

  ngOnInit() {
    this.loadContacts();
  }

  private loadContacts() {
    const contactsSubscription = this.dataService.getContacts().subscribe({
      next: (data) => {
        this.contacts = data;
        
        // Wenn ihr hier loggen wollt, Hier loggen für Firebase DB Data 
        data.forEach(contact => {
          console.log('Contact:', contact.firstName);
        });
      },
      error: (error) => {
        console.error('Fehler beim Laden der Contacts:', error);
      }
    });
    this.subscriptions.push(contactsSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
    });
  }
}
