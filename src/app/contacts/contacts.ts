import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { Interfaces, NewContact } from '../interfaces/interfaces';
import { ContactDetail } from './contact-detail/contact-detail';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ContactDetail, FormsModule],
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.scss'],
})

export class Contacts implements OnInit {
  private dataService = inject(DataService);
  
  contacts: Interfaces[] = [];
  groupedContacts: { [key: string]: Interfaces[] } = {};
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  selectedContact: Interfaces | null = null;
  
  isEditOpen = false;
  editingContact: Interfaces | null = null;
  isAddOpen = false;
  newContact: NewContact = { fullName: '', email: '', phone: '' };

  ngOnInit() {
    this.dataService.getContacts().subscribe(contacts => {
      this.contacts = contacts;
      this.groupContactsByFirstLetter();
    });
  }

  groupContactsByFirstLetter() {
    this.groupedContacts = {};
    this.contacts.forEach(contact => {
      if (contact.lastName) {
        const letter = contact.lastName.charAt(0).toUpperCase();
        if (!this.groupedContacts[letter]) this.groupedContacts[letter] = [];
        this.groupedContacts[letter].push(contact);
      }
    });
    Object.keys(this.groupedContacts).forEach(letter => {
      this.groupedContacts[letter].sort((a, b) => a.lastName.localeCompare(b.lastName));
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getContactColor(contact: Interfaces): string {
    const colors = ['#FF5EB3', '#6E52FF', '#FF7A00', '#9327FF', '#1FD7C1', '#FF4646', '#C3FF2B', '#00BEE8', '#FFA35E', '#FFBB2B', '#FFC701', '#FFE62B', '#0038FF', '#FC71FF'];
    return colors[(contact.firstName.charCodeAt(0) + contact.lastName.charCodeAt(0)) % colors.length];
  }

  isSelected(contact: Interfaces): boolean {
    return this.selectedContact?.id === contact.id;
  }

  selectContact(contact: Interfaces): void {
    this.selectedContact = contact;
  }

  onEdit(): void {
    if (!this.selectedContact) return;
    this.editingContact = { ...this.selectedContact };
    this.isEditOpen = true;
  }

  async saveEdit(): Promise<void> {
    if (!this.editingContact?.id) return;
    try {
      await this.dataService.updateContact(this.editingContact.id, this.editingContact);
      this.closeEdit();
    } catch (err: any) {
      console.error('UPDATE failed:', err?.code, err?.message);
    }
  }

  async onDelete(): Promise<void> {
    if (!this.editingContact?.id) {
      console.error('Cannot delete: No ID found for contact');
      return;
    }
    
    try {
      await this.dataService.deleteContact(this.editingContact.id);
      if (this.selectedContact?.id === this.editingContact.id) {
        this.selectedContact = null;
      }
      this.closeEdit();
    } catch (err: any) {
      console.error('DELETE failed:', err?.code, err?.message);
    }
  }

  closeEdit(): void {
    this.isEditOpen = false;
    this.editingContact = null;
  }

  onAdd(): void {
    this.newContact = { fullName: '', email: '', phone: '' };
    this.isAddOpen = true;
  }

  async saveAdd(): Promise<void> {
    try {
      const [firstName, ...lastNameParts] = this.newContact.fullName.trim().split(' ');
      const contactToSave = {
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: this.newContact.email,
        phone: this.newContact.phone
      };
      await this.dataService.addContact(contactToSave);
      this.closeAdd();
    } catch (err: any) {
      console.error('ADD failed:', err?.code, err?.message);
    }
  }

  closeAdd(): void {
    this.isAddOpen = false;
    this.newContact = { fullName: '', email: '', phone: '' };
  }
}
