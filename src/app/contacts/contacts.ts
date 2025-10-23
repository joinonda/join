import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { Interfaces } from '../interfaces/interfaces';
import { ContactDetail } from './contact-detail/contact-detail';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ContactDetail],
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.scss'],
})
export class Contacts implements OnInit {
  contacts: Interfaces[] = [];
  groupedContacts: { [key: string]: Interfaces[] } = {};
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  selectedContact: Interfaces | null = null;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.dataService.getContacts().subscribe((contacts) => {
      this.contacts = contacts;
      this.groupContactsByFirstLetter();
    });
  }

  groupContactsByFirstLetter() {
    this.groupedContacts = {};
    this.contacts.forEach((contact) => {
      if (contact.lastName && contact.lastName.length > 0) {
        const firstLetter = contact.lastName.charAt(0).toUpperCase();
        if (!this.groupedContacts[firstLetter]) {
          this.groupedContacts[firstLetter] = [];
        }
        this.groupedContacts[firstLetter].push(contact);
      }
    });

    Object.keys(this.groupedContacts).forEach((letter) => {
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
      '#FF5EB3',
      '#6E52FF',
      '#FF7A00',
      '#9327FF',
      '#1FD7C1',
      '#FF4646',
      '#C3FF2B',
      '#00BEE8',
      '#FFA35E',
      '#FFBB2B',
      '#FFC701',
      '#FFE62B',
      '#0038FF',
      '#FC71FF',
    ];
    const hash = contact.firstName.charCodeAt(0) + contact.lastName.charCodeAt(0);
    return colors[hash % colors.length];
  }

  isSelected(contact: Interfaces): boolean {
    return this.selectedContact?.id === contact.id;
  }

  selectContact(contact: Interfaces): void {
    this.selectedContact = contact;
  }

  isEditOpen = false;
  editingContact: Interfaces | null = null;

  onEdit(): void {
    if (!this.selectedContact) return;
    this.editingContact = { ...this.selectedContact };
    this.isEditOpen = true;
  }

  async saveEdit(): Promise<void> {
    const c = this.editingContact;
    if (!c || !c.id) {
      this.closeEdit();
      return;
    }
    try {
      await this.dataService.updateContact(c);
      const i = this.contacts.findIndex((x) => x.id === c.id);
      if (i > -1) this.contacts[i] = { ...c };
      this.selectedContact = { ...c };
      this.groupContactsByFirstLetter();
      this.closeEdit();
    } catch (err) {
      console.error(err);
    }
  }

  async onDelete(): Promise<void> {
    const c = this.editingContact;
    if (!c || !c.id) {
      this.closeEdit();
      return;
    }
    try {
      await this.dataService.deleteContact(c.id);
      this.contacts = this.contacts.filter((x) => x.id !== c.id);
      if (this.selectedContact?.id === c.id) this.selectedContact = null;
      this.groupContactsByFirstLetter();
      this.closeEdit();
    } catch (err) {
      console.error(err);
    }
  }

  closeEdit(): void {
    this.isEditOpen = false;
    this.editingContact = null;
  }
}
