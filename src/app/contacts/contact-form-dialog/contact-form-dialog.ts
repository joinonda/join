import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Interfaces } from '../../interfaces/interfaces';

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-contact-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-form-dialog.html',
  styleUrl: './contact-form-dialog.scss',
})
export class ContactFormDialog implements OnInit {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() contact?: Interfaces;
  @Input() contactColor: string = '#FF7A00';
  @Output() save = new EventEmitter<ContactFormData>();
  @Output() delete = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  formData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
  };

  nameError: string | null = null;
  emailError: string | null = null;
  phoneError: string | null = null;

  ngOnInit(): void {
    if (this.mode === 'edit' && this.contact) {
      this.formData = {
        name: `${this.contact.firstName} ${this.contact.lastName}`,
        email: this.contact.email,
        phone: this.contact.phone,
      };
    }
  }

  validateName(): void {
    const name = this.formData.name?.trim();
    if (!name) {
      this.nameError = 'Name is required';
      return;
    }

    const words = name.split(' ').filter((w) => w.length > 0);
    if (words.length < 2) {
      this.nameError = 'First and last name required';
      return;
    }

    const isCapitalized = words.every((w) => w[0] === w[0]?.toUpperCase());
    if (!isCapitalized) {
      this.nameError = 'Each name must start with a capital letter';
      return;
    }

    this.nameError = null;
  }

  validateEmail(): void {
    const email = this.formData.email?.trim();
    if (!email) {
      this.emailError = 'Email is required';
      return;
    }

    if (email.length < 3) {
      this.emailError = 'Email is too short';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.emailError = 'Invalid email format';
      return;
    }

    this.emailError = null;
  }

  validatePhone(): void {
    const phone = this.formData.phone?.trim();
    if (!phone) {
      this.phoneError = 'A real phone number is required';
      return;
    }

    if (!phone.startsWith('+') && !phone.startsWith('0')) {
      this.phoneError = 'A real phone number is required';
      return;
    }

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 12) {
      this.phoneError = 'A real phone number is required';
      return;
    }

    this.phoneError = null;
  }

  get title(): string {
    return this.mode === 'add' ? 'Add contact' : 'Edit contact';
  }

  get subtitle(): string {
    return this.mode === 'add' ? 'Tasks are better with a team!' : '';
  }

  get saveButtonText(): string {
    return this.mode === 'add' ? 'Create contact' : 'Save';
  }

  get initials(): string {
    if (this.mode === 'edit' && this.contact) {
      return `${this.contact.firstName.charAt(0)}${this.contact.lastName.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  onSave(): void {
    this.validateName();
    this.validateEmail();
    this.validatePhone();

    if (this.nameError || this.emailError || this.phoneError) {
      return;
    }

    this.save.emit(this.formData);
  }

  onDelete(): void {
    this.delete.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
