import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { Contact, NewContact } from '../interfaces/contacts-interfaces';
import { ContactDetail } from './contact-detail/contact-detail';
import { ContactFormDialog, ContactFormData } from './contact-form-dialog/contact-form-dialog';
import { ContactDetailDialog } from './contact-detail-dialog/contact-detail-dialog';
import { ToastComponent } from '../shared/toast/toast';
import { getContactColor } from '../utilities/contact.helpfunctions';

/**
 * Component for managing and displaying contacts.
 * Handles contact listing, grouping by first letter of last name, editing, adding, and deletion.
 * Supports both desktop and mobile views with responsive dialogs.
 */
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
  /** DataService for retrieving and managing contacts. */
  private dataService = inject(DataService);

  /** Reference to the toast component for displaying messages. */
  @ViewChild(ToastComponent) toast!: ToastComponent;

  /** Array containing all contacts loaded from the data service. */
  contacts: Contact[] = [];
  /** Object grouping contacts by the first letter of their last name. */
  groupedContacts: { [key: string]: Contact[] } = {};
  /** Array of alphabet letters for filtering and grouping display. */
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  /** Currently selected contact for detail view (desktop). */
  selectedContact: Contact | null = null;
  /** Flag indicating if the edit dialog is open. */
  isEditOpen = false;
  /** Contact currently being edited. */
  editingContact: Contact | null = null;
  /** Flag indicating if the add dialog is open. */
  isAddOpen = false;
  /** Temporary contact data for the add form. */
  newContact: NewContact = { fullName: '', email: '', phone: '' };
  /** Flag indicating if the detail dialog is open (mobile). */
  isDetailDialogOpen = false;
  /** Contact displayed in the detail dialog (mobile). */
  detailDialogContact: Contact | null = null;

  /**
   * Initializes the component and loads contacts from the data service.
   * Subscribes to contact updates and groups them by first letter of last name.
   */
  ngOnInit() {
    this.dataService.getContacts().subscribe((contacts) => {
      this.contacts = contacts;
      this.groupContactsByFirstLetter();
    });
  }

  /**
   * Groups contacts by the first letter of their last name and sorts them alphabetically.
   * Creates a dictionary where keys are uppercase letters and values are sorted contact arrays.
   */
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

  /**
   * Gets the initials from first and last name for avatar display.
   * Takes the first character of each name and converts to uppercase.
   * @param firstName - The first name of the contact.
   * @param lastName - The last name of the contact.
   * @returns Uppercase string containing the first letter of each name (e.g., "JD" for "John Doe").
   */
  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  /**
   * Gets the color associated with a contact based on their name.
   * Uses a utility function that calculates color from name character codes.
   * @param contact - The contact to get the color for.
   * @returns The color hex string (e.g., "#FF5EB3").
   */
  getContactColor(contact: Contact): string {
    return getContactColor(contact);
  }

  /**
   * Checks if a contact is currently selected.
   * @param contact - The contact to check.
   * @returns True if the contact is selected.
   */
  isSelected(contact: Contact): boolean {
    return this.selectedContact?.id === contact.id;
  }

  /**
   * Selects a contact and opens detail dialog on mobile devices.
   * On desktop, the contact is displayed in the detail panel.
   * @param contact - The contact to select and display.
   */
  selectContact(contact: Contact): void {
    this.selectedContact = contact;
    if (this.isMobile()) {
      this.openDetailDialog(contact);
    }
  }

  /**
   * Checks if the current viewport is mobile.
   * @returns True if window width is 1024px or less.
   */
  private isMobile(): boolean {
    return window.innerWidth <= 1024;
  }

  /**
   * Opens the detail dialog for a contact (mobile view).
   * Sets the contact to display and shows the dialog overlay.
   * @param contact - The contact to display in the dialog.
   */
  openDetailDialog(contact: Contact): void {
    this.detailDialogContact = contact;
    this.isDetailDialogOpen = true;
  }

  /**
   * Closes the detail dialog and clears the selected contact.
   * Resets the dialog state for mobile view.
   */
  closeDetailDialog(): void {
    this.isDetailDialogOpen = false;
    this.detailDialogContact = null;
  }

  /**
   * Opens the edit dialog from the detail dialog (mobile).
   * Copies the contact data and closes the detail dialog before opening edit.
   */
  onDetailEdit(): void {
    if (this.detailDialogContact) {
      this.editingContact = { ...this.detailDialogContact };
      this.isEditOpen = true;
      this.closeDetailDialog();
    }
  }

  /**
   * Initiates deletion from the detail dialog (mobile).
   * Sets the contact to delete and closes the detail dialog before deletion.
   */
  onDetailDelete(): void {
    if (this.detailDialogContact) {
      this.editingContact = { ...this.detailDialogContact };
      this.closeDetailDialog();
      this.onDelete();
    }
  }

  /**
   * Opens the edit dialog for the selected contact (desktop).
   * Requires a selected contact to be present.
   */
  onEdit(): void {
    if (!this.selectedContact) return;
    this.editingContact = { ...this.selectedContact };
    this.isEditOpen = true;
  }

  /**
   * Deletes the selected or editing contact.
   * Handles both desktop and mobile deletion flows.
   * Removes the contact from the list and updates the UI accordingly.
   */
  async onDelete(): Promise<void> {
    const contactToDelete = this.getContactToDelete();
    if (!this.canDeleteContact(contactToDelete)) return;

    try {
      await this.performDelete(contactToDelete!);
      this.handleDeleteSuccess(contactToDelete!);
    } catch (err: any) {
      this.handleDeleteError(err);
    }
  }

  /** Gets the contact to delete (editing or selected). */
  private getContactToDelete(): Contact | null {
    return this.editingContact || this.selectedContact;
  }

  /** Validates if a contact can be deleted. */
  private canDeleteContact(contact: Contact | null): boolean {
    if (!contact?.id) {
      console.error('Cannot delete: No contact selected');
      return false;
    }
    return true;
  }

  /** Performs the deletion of a contact. */
  private async performDelete(contact: Contact): Promise<void> {
    await this.dataService.deleteContact(contact.id!);
  }

  /** Handles successful contact deletion. */
  private handleDeleteSuccess(contact: Contact): void {
    this.removeContactFromList(contact);
    this.clearSelectedContactIfDeleted(contact);
    this.closeEdit();
    this.toast.show('Contact successfully deleted');
  }

  /** Removes a contact from the contacts list. */
  private removeContactFromList(contact: Contact): void {
    this.contacts = this.contacts.filter((c) => c.id !== contact.id);
    this.groupContactsByFirstLetter();
  }

  /** Clears the selected contact if it was deleted. */
  private clearSelectedContactIfDeleted(contact: Contact): void {
    if (this.selectedContact?.id === contact.id) {
      this.selectedContact = null;
    }
  }

  /** Handles errors during contact deletion. */
  private handleDeleteError(err: any): void {
    console.error('Error deleting contact:', err);
    this.toast.show('Error deleting contact. Please try again.');
  }

  /** Closes the edit dialog and clears the editing contact. */
  closeEdit(): void {
    this.isEditOpen = false;
    this.editingContact = null;
  }

  /** Opens the add contact dialog. */
  onAdd(): void {
    this.newContact = { fullName: '', email: '', phone: '' };
    this.isAddOpen = true;
  }

  /**
   * Saves a new contact from form data.
   * Parses the name into firstName and lastName, then saves to the database.
   * Shows success message and closes the dialog on completion.
   * @param formData - The form data containing name, email, and phone.
   */
  async saveAdd(formData: ContactFormData): Promise<void> {
    try {
      const contactToSave = this.buildContactFromFormData(formData);
      await this.dataService.addContact(contactToSave);
      this.handleAddSuccess();
    } catch (err: any) {}
  }

  /**
   * Builds a contact object from form data by splitting the name.
   * First word becomes firstName, remaining words become lastName.
   * @param formData - The form data with full name, email, and phone.
   * @returns A contact object without id, ready for database insertion.
   */
  private buildContactFromFormData(formData: ContactFormData): Omit<Contact, 'id'> {
    const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
    return {
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      email: formData.email,
      phone: formData.phone,
    };
  }

  /** Handles successful contact creation. */
  private handleAddSuccess(): void {
    this.closeAdd();
    this.toast.show('Contact successfully created');
  }

  /** Closes the add dialog and resets the form. */
  closeAdd(): void {
    this.isAddOpen = false;
    this.newContact = { fullName: '', email: '', phone: '' };
  }

  /**
   * Saves changes to an existing contact.
   * Updates the contact in the database and refreshes the UI.
   * Updates both the contacts list and selected contact if applicable.
   * @param formData - The updated form data with name, email, and phone.
   */
  async saveEdit(formData: ContactFormData): Promise<void> {
    if (!this.canEditContact()) return;
    try {
      const updatedContact = this.buildUpdatedContact(formData);
      await this.performUpdate(updatedContact);
      this.handleUpdateSuccess(updatedContact);
    } catch (err: any) {}
  }

  /**
   * Checks if a contact can be edited.
   * @returns True if an editing contact with an id exists.
   */
  private canEditContact(): boolean {
    return !!this.editingContact?.id;
  }

  /**
   * Builds an updated contact from form data.
   * Merges form data with existing contact properties and splits the name.
   * @param formData - The form data containing updated name, email, and phone.
   * @returns The complete updated contact object with all properties.
   */
  private buildUpdatedContact(formData: ContactFormData): Contact {
    const [firstName, ...lastNameParts] = formData.name.trim().split(' ');
    return {
      ...this.editingContact!,
      firstName: firstName || '',
      lastName: lastNameParts.join(' ') || '',
      email: formData.email,
      phone: formData.phone,
    };
  }

  /**
   * Performs the update operation on the data service.
   * @param contact - The contact to update.
   */
  private async performUpdate(contact: Contact): Promise<void> {
    await this.dataService.updateContact(contact.id!, contact);
  }

  /**
   * Handles successful contact update.
   * Updates the contact in the list, refreshes grouping, and closes the edit dialog.
   * @param updatedContact - The updated contact object with new values.
   */
  private handleUpdateSuccess(updatedContact: Contact): void {
    this.updateContactInList(updatedContact);
    this.updateSelectedContactIfMatch(updatedContact);
    this.closeEdit();
  }

  /**
   * Updates a contact in the contacts list and refreshes grouping.
   * Finds the contact by id and replaces it with the updated version.
   * @param contact - The updated contact to replace in the list.
   */
  private updateContactInList(contact: Contact): void {
    const contactIndex = this.contacts.findIndex((c) => c.id === contact.id);
    if (contactIndex !== -1) {
      this.contacts[contactIndex] = contact;
      this.groupContactsByFirstLetter();
    }
  }

  /**
   * Updates the selected contact if it matches the updated one.
   * Ensures the detail view shows the latest data after editing.
   * @param contact - The updated contact to check against selected contact.
   */
  private updateSelectedContactIfMatch(contact: Contact): void {
    if (this.selectedContact?.id === contact.id) {
      this.selectedContact = contact;
    }
  }
}
