import { Component, Input, Output, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Contact } from '../../interfaces/contacts-interfaces';
import { ContactDeleteDialogComponent } from '../contact-delete-dialog/contact-delete-dialog';

/**
 * Component for displaying contact details in a dialog overlay.
 * Handles contact display, editing, deletion, and menu interactions.
 */
@Component({
  selector: 'app-contact-detail-dialog',
  standalone: true,
  imports: [CommonModule, ContactDeleteDialogComponent],
  templateUrl: './contact-detail-dialog.html',
  styleUrl: './contact-detail-dialog.scss',
})
export class ContactDetailDialog implements OnDestroy {
  /** The contact to display. */
  @Input() contact: Contact | null = null;
  /** The color associated with the contact. */
  @Input() contactColor: string = '';
  /** Event emitter for edit action. */
  @Output() edit = new EventEmitter<void>();
  /** Event emitter for delete action. */
  @Output() delete = new EventEmitter<void>();
  /** Event emitter for close action. */
  @Output() close = new EventEmitter<void>();

  /** Flag indicating if the menu is visible. */
  showMenu = false;
  /** Flag indicating if the delete confirmation dialog is shown. */
  showDeleteDialog = false;

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
   * Toggles the visibility of the menu.
   */
  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  /**
   * Closes the menu and emits the edit event.
   */
  onEdit(): void {
    this.showMenu = false;
    this.edit.emit();
  }

  /**
   * Closes the menu and opens the delete confirmation dialog.
   */
  onDelete(): void {
    this.showMenu = false;
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

  /**
   * Emits the close event to notify the parent component.
   */
  onClose(): void {
    this.close.emit();
  }

  /**
   * Handles backdrop clicks to close the dialog.
   * @param event - The mouse event from the backdrop click.
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  /**
   * Handles window resize events.
   * Closes the dialog when the window width exceeds 1024px (desktop view).
   * @param event - The resize event.
   */
  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any): void {
    if (window.innerWidth > 1024) {
      this.onClose();
    }
  }

  /**
   * Lifecycle hook called when the component is destroyed.
   */
  ngOnDestroy(): void {}
}
