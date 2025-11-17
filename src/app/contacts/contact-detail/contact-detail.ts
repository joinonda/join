import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../interfaces/contacts-interfaces';
import { ContactDeleteDialogComponent } from '../contact-delete-dialog/contact-delete-dialog';

/**
 * Component for displaying detailed information about a contact.
 * Handles contact display, editing, and deletion with animation support.
 */
@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, ContactDeleteDialogComponent],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
})
export class ContactDetail implements OnChanges {
  /** The contact to display. */
  @Input() contact: Contact | null = null;
  /** The color associated with the contact. */
  @Input() contactColor: string = '';
  /** The unique key/ID of the contact. */
  @Input() contactKey: string = '';
  /** Event emitter for edit action. */
  @Output() edit = new EventEmitter<void>();
  /** Event emitter for delete action. */
  @Output() delete = new EventEmitter<void>();

  /** Flag indicating if the contact detail view is visible. */
  isVisible = true;
  /** The currently displayed contact ID. */
  currentContactId = '';
  /** Flag indicating if the delete confirmation dialog is shown. */
  showDeleteDialog = false;

  /**
   * Handles changes to input properties.
   * Manages visibility animation when the contact key changes.
   * @param changes - Object containing the changed properties.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['contactKey'] &&
      this.contactKey &&
      this.currentContactId &&
      this.contactKey !== this.currentContactId
    ) {
      this.isVisible = false;
      setTimeout(() => {
        this.currentContactId = this.contactKey;
        this.isVisible = true;
      }, 200);
    } else if (changes['contactKey'] && this.contactKey) {
      this.currentContactId = this.contactKey;
      this.isVisible = true;
    }
  }

  /**
   * Generates initials from the first and last name.
   * @param firstName - The first name of the contact.
   * @param lastName - The last name of the contact.
   * @returns Uppercase string containing the first letter of each name.
   */
  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  /**
   * Emits the edit event to notify the parent component.
   */
  onEdit(): void {
    this.edit.emit();
  }

  /**
   * Opens the delete confirmation dialog.
   */
  onDelete(): void {
    this.showDeleteDialog = true;
  }

  /**
   * Confirms the deletion and emits the delete event.
   */
  confirmDelete(): void {
    this.showDeleteDialog = false;
    this.delete.emit();
  }

  /**
   * Cancels the deletion and closes the delete dialog.
   */
  cancelDelete(): void {
    this.showDeleteDialog = false;
  }
}
