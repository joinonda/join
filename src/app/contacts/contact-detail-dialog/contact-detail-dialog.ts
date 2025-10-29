import { Component, Input, Output, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Interfaces } from '../../interfaces/contacts-interfaces';
import { ContactDeleteDialogComponent } from '../contact-delete-dialog/contact-delete-dialog';

@Component({
  selector: 'app-contact-detail-dialog',
  standalone: true,
  imports: [CommonModule, ContactDeleteDialogComponent],
  templateUrl: './contact-detail-dialog.html',
  styleUrl: './contact-detail-dialog.scss',
})
export class ContactDetailDialog implements OnDestroy {
  @Input() contact: Interfaces | null = null;
  @Input() contactColor: string = '';
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  showMenu = false;
  showDeleteDialog = false;

  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0) : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  onEdit(): void {
    this.showMenu = false;
    this.edit.emit();
  }

  onDelete(): void {
    this.showMenu = false;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this.showDeleteDialog = false;
    this.delete.emit();
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any): void {
    if (window.innerWidth > 1024) {
      this.onClose();
    }
  }

  ngOnDestroy(): void {}
}
