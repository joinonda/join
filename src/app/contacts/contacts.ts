import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { Interfaces } from '../interfaces/interfaces';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.scss'],
})
export class Contacts implements OnInit {
  contacts: Interfaces[] = [];
  groupedContacts: { [key: string]: Interfaces[] } = {};
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.dataService.getContacts().subscribe(contacts => {
      console.log('Geladene Kontakte:', contacts);
      this.contacts = contacts;
      this.groupContactsByFirstLetter();
      console.log('Gruppierte Kontakte:', this.groupedContacts);
    });
  }

  groupContactsByFirstLetter() {
    this.groupedContacts = {};
    this.contacts.forEach(contact => {

      if (contact.lastName && contact.lastName.length > 0) {
        const firstLetter = contact.lastName.charAt(0).toUpperCase();
        if (!this.groupedContacts[firstLetter]) {
          this.groupedContacts[firstLetter] = [];
        }
        this.groupedContacts[firstLetter].push(contact);
      }
    });

    Object.keys(this.groupedContacts).forEach(letter => {
      this.groupedContacts[letter].sort((a, b) => {
        if (a.lastName && b.lastName) {
          return a.lastName.localeCompare(b.lastName);
        }
        return 0;
      });
    });
  }

  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  getContactColor(contact: Interfaces): string {
    const colors = [
      '#FF5EB3', '#6E52FF', '#FF7A00', '#9327FF', '#1FD7C1', 
      '#FF4646', '#C3FF2B', '#00BEE8', '#FFA35E', '#FFBB2B', 
      '#FFC701', '#FFE62B', '#0038FF', '#FC71FF'
    ];
    const hash = contact.firstName.charCodeAt(0) + contact.lastName.charCodeAt(0);
    return colors[hash % colors.length];
  }
}
