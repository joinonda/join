import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Interfaces } from '../../interfaces/interfaces';
import { ContactDeleteDialogComponent } from '../contact-delete-dialog/contact-delete-dialog';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, ContactDeleteDialogComponent],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss'
})
export class ContactDetail implements OnChanges {
  @Input() contact: Interfaces | null = null;
  @Input() contactColor: string = '';
  @Input() contactKey: string = '';
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  isVisible = true;
  currentContactId = '';
  showDeleteDialog = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contactKey'] && this.contactKey && this.currentContactId && this.contactKey !== this.currentContactId) {
      // Neuer Kontakt wurde ausgewählt - Fade out dann fade in
      this.isVisible = false;
      setTimeout(() => {
        this.currentContactId = this.contactKey;
        this.isVisible = true;
      }, 200); // Kurze Pause für Fade-Out
    } else if (changes['contactKey'] && this.contactKey) {
      // Erster Kontakt
      this.currentContactId = this.contactKey;
      this.isVisible = true;
    }
  }

  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  onEdit(): void {
    this.edit.emit();
  }

  onDelete(): void {
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.showDeleteDialog = false;
    this.delete.emit();
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }
}
