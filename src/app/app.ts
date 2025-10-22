import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
import { DataService } from './services/data.service';
import { Subscription } from 'rxjs';
import { Interfaces } from './interfaces/interfaces';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
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
      },
      error: (error) => {
        console.error('Fehler beim Laden der Contacts:', error);
      },
    });
    this.subscriptions.push(contactsSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
    });
  }
}
