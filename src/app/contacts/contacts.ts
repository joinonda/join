import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { Interfaces, NewContact } from '../interfaces/interfaces';
import { ContactDetail } from './contact-detail/contact-detail';
import { ContactFormDialog, ContactFormData } from './contact-form-dialog/contact-form-dialog';
import { ContactDetailDialog } from './contact-detail-dialog/contact-detail-dialog';
import { ToastComponent } from '../shared/toast/toast';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ContactDetail,
    FormsModule,
    ContactFormDialog,
    ContactDetailDialog,
    ToastComponent,
  ],
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.scss', './contacts-mobile.scss'],
})
export class Contacts implements OnInit {
  private dataService = inject(DataService);

  @ViewChild(ToastComponent) toast!: ToastComponent;

  contacts: Interfaces[] = [];
  groupedContacts: { [key: string]: Interfaces[] } = {};
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  selectedContact: Interfaces | null = null;

  isEditOpen = false;
  editingContact: Interfaces | null = null;
  isAddOpen = false;
  newContact: NewContact = { fullName: '', email: '', phone: '' };
  isDetailDialogOpen = false;
  detailDialogContact: Interfaces | null = null;

  ngOnInit() {
    this.dataService.getContacts().subscribe((contacts) => {
      this.contacts = contacts;
      this.groupContactsByFirstLetter();
    });
  }

  groupContactsByFirstLetter() {
    this.groupedContacts = {};
    this.contacts.forEach((contact) => {
      if (contact.lastName) {
        const letter = contact.lastName.charAt(0).toUpperCase();
        if (!this.groupedContacts[letter]) this.groupedContacts[letter] = [];
        this.groupedContacts[letter].push(contact);
      }
    });
    Object.keys(this.groupedContacts).forEach((letter) => {
      this.groupedContacts[letter].sort((a, b) => a.lastName.localeCompare(b.lastName));
    });
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
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
    return colors[
      (contact.firstName.charCodeAt(0) + contact.lastName.charCodeAt(0)) % colors.length
    ];
  }

  isSelected(contact: Interfaces): boolean {
    return this.selectedContact?.id === contact.id;
  }

  selectContact(contact: Interfaces): void {
    this.selectedContact = contact;

    if (window.innerWidth <= 1024) {
      this.openDetailDialog(contact);
    }
  }

  openDetailDialog(contact: Interfaces): void {
    this.detailDialogContact = contact;
    this.isDetailDialogOpen = true;
  }

  closeDetailDialog(): void {
    this.isDetailDialogOpen = false;
    this.detailDialogContact = null;
  }

  onDetailEdit(): void {
    if (this.detailDialogContact) {
      this.editingContact = { ...this.detailDialogContact };
      this.isEditOpen = true;
      this.closeDetailDialog();
    }
  }

  onDetailDelete(): void {
    if (this.detailDialogContact) {
      this.editingContact = { ...this.detailDialogContact };
      this.closeDetailDialog();
      this.onDelete();
    }
  }

  onEdit(): void {
    if (!this.selectedContact) return;
    this.editingContact = { ...this.selectedContact };
    this.isEditOpen = true;
  }

  async onDelete(): Promise<void> {
    const contactToDelete = this.editingContact || this.selectedContact;

    if (!contactToDelete?.id) {
      console.error('Cannot delete: No contact selected');
      return;
    }

    try {
      await this.dataService.deleteContact(contactToDelete.id);
      if (this.selectedContact?.id === contactToDelete.id) {
        this.selectedContact = null;
      }

      this.closeEdit();
    } catch (err: any) {}
  }

  closeEdit(): void {
    this.isEditOpen = false;
    this.editingContact = null;
  }

  onAdd(): void {
    this.newContact = { fullName: '', email: '', phone: '' };
    this.isAddOpen = true;
  }

  async saveAdd(formData: ContactFormData): Promise<void> {
    try {
      const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
      const contactToSave = {
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: formData.email,
        phone: formData.phone,
      };
      await this.dataService.addContact(contactToSave);
      this.closeAdd();
      this.toast.show('Contact successfully created');
    } catch (err: any) {}
  }

  closeAdd(): void {
    this.isAddOpen = false;
    this.newContact = { fullName: '', email: '', phone: '' };
  }

  async saveEdit(formData: ContactFormData): Promise<void> {
    if (!this.editingContact?.id) return;
    try {
      const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
      const updatedContact = {
        ...this.editingContact,
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: formData.email,
        phone: formData.phone,
      };
      await this.dataService.updateContact(updatedContact.id, updatedContact);
      this.closeEdit();
    } catch (err: any) {}
  }
}
