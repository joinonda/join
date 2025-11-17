import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../interfaces/contacts-interfaces';

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
  styleUrls: ['./contact-form-dialog.scss', './contact-form-dialog-mobile.scss'],
})
export class ContactFormDialog implements OnInit {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() contact?: Contact;
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

  /** Initializes the component and populates form data if in edit mode. */
  ngOnInit(): void {
    if (this.mode === 'edit' && this.contact) {
      this.formData = {
        name: `${this.contact.firstName} ${this.contact.lastName}`,
        email: this.contact.email,
        phone: this.contact.phone,
      };
    }
  }

  /**
   * Checks if the name field is valid.
   * @returns True if the name has at least two words and each word starts with a capital letter.
   */
  isNameValid(): boolean {
    const name = this.formData.name?.trim();
    if (!name) return false;
    const words = name.split(' ').filter((w) => w.length > 0);
    if (words.length < 2) return false;
    const isCapitalized = words.every((w) => w[0] === w[0]?.toUpperCase());
    return isCapitalized;
  }

  /**
   * Checks if the email field is valid.
   * @returns True if the email has at least 3 characters and matches the email format.
   */
  isEmailValid(): boolean {
    const email = this.formData.email?.trim();
    if (!email || email.length < 3) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Checks if the phone field is valid.
   * @returns True if the phone starts with 0 or +, has valid characters, and contains at least 6 digits.
   */
  isPhoneValid(): boolean {
    const raw = this.formData.phone?.trim();
    if (!raw) return false;
    if (!/^(0|\+)/.test(raw)) return false;
    if (!/^[+0][0-9\s\-()]*$/.test(raw)) return false;
    const digits = raw.replace(/\D/g, '');
    return digits.length >= 6;
  }

  /**
   * Checks if all form fields are valid and the form can be submitted.
   * @returns True if name, email, and phone are all valid.
   */
  get canSubmit(): boolean {
    return this.isNameValid() && this.isEmailValid() && this.isPhoneValid();
  }

  /** Validates the name field and sets appropriate error messages. */
  validateName(): void {
    const name = this.getTrimmedName();
    if (this.isNameEmpty(name)) {
      this.setNameRequiredError();
      return;
    }
    this.validateNameFormat(name);
  }

  /**
   * Validates the format of the name (word count and capitalization).
   * @param name - The trimmed name to validate.
   */
  private validateNameFormat(name: string): void {
    const words = this.getNameWords(name);
    if (this.hasLessThanTwoWords(words)) {
      this.setNameTwoWordsError();
      return;
    }
    if (!this.isNameCapitalized(words)) {
      this.setNameCapitalizationError();
      return;
    }
    this.clearNameError();
  }

  /**
   * Gets the trimmed name from form data.
   * @returns The trimmed name or empty string.
   */
  private getTrimmedName(): string {
    return this.formData.name?.trim() || '';
  }

  /**
   * Checks if the name is empty.
   * @param name - The name to check.
   * @returns True if the name is empty.
   */
  private isNameEmpty(name: string): boolean {
    return !name;
  }

  /** Sets the error message for required name field. */
  private setNameRequiredError(): void {
    this.nameError = 'Name is required';
  }

  /**
   * Splits the name into words and filters out empty strings.
   * @param name - The name to split.
   * @returns Array of non-empty words.
   */
  private getNameWords(name: string): string[] {
    return name.split(' ').filter((w) => w.length > 0);
  }

  /**
   * Checks if the name has less than two words.
   * @param words - Array of words to check.
   * @returns True if there are less than two words.
   */
  private hasLessThanTwoWords(words: string[]): boolean {
    return words.length < 2;
  }

  /** Sets the error message for two words requirement. */
  private setNameTwoWordsError(): void {
    this.nameError = 'First and last name required';
  }

  /**
   * Checks if all words in the name start with a capital letter.
   * @param words - Array of words to check.
   * @returns True if all words are capitalized.
   */
  private isNameCapitalized(words: string[]): boolean {
    return words.every((w) => w[0] === w[0]?.toUpperCase());
  }

  /** Sets the error message for capitalization requirement. */
  private setNameCapitalizationError(): void {
    this.nameError = 'Each name must start with a capital letter';
  }

  /** Clears the name error message. */
  private clearNameError(): void {
    this.nameError = null;
  }

  /** Validates the email field and sets appropriate error messages. */
  validateEmail(): void {
    const email = this.getTrimmedEmail();
    if (this.isEmailEmpty(email)) {
      this.setEmailRequiredError();
      return;
    }
    if (!this.isEmailFormatValid(email)) {
      this.setEmailFormatError();
      return;
    }
    this.clearEmailError();
  }

  /**
   * Gets the trimmed email from form data.
   * @returns The trimmed email or empty string.
   */
  private getTrimmedEmail(): string {
    return this.formData.email?.trim() || '';
  }

  /**
   * Checks if the email is empty.
   * @param email - The email to check.
   * @returns True if the email is empty.
   */
  private isEmailEmpty(email: string): boolean {
    return !email;
  }

  /** Sets the error message for required email field. */
  private setEmailRequiredError(): void {
    this.emailError = 'Email is required';
  }

  /**
   * Checks if the email matches the valid email format.
   * @param email - The email to validate.
   * @returns True if the email format is valid.
   */
  private isEmailFormatValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /** Sets the error message for invalid email format. */
  private setEmailFormatError(): void {
    this.emailError = 'Must contain @ and domain';
  }

  /** Clears the email error message. */
  private clearEmailError(): void {
    this.emailError = null;
  }

  /** Validates the phone field and sets appropriate error messages. */
  validatePhone(): void {
    const raw = this.getTrimmedPhone();
    if (this.isPhoneEmpty(raw)) {
      this.setPhoneRequiredError();
      return;
    }
    this.validatePhoneFormat(raw);
  }

  /**
   * Validates the format of the phone number (prefix, characters, and digit count).
   * @param raw - The trimmed phone number to validate.
   */
  private validatePhoneFormat(raw: string): void {
    if (!this.startsWithZeroOrPlus(raw)) {
      this.setPhoneStartError();
      return;
    }
    if (!this.hasValidPhoneCharacters(raw)) {
      this.setPhoneInvalidCharsError();
      return;
    }
    if (!this.hasMinimumDigits(raw)) {
      this.setPhoneMinDigitsError();
      return;
    }
    this.clearPhoneError();
  }

  /**
   * Gets the trimmed phone number from form data.
   * @returns The trimmed phone number or empty string.
   */
  private getTrimmedPhone(): string {
    return this.formData.phone?.trim() || '';
  }

  /**
   * Checks if the phone number is empty.
   * @param raw - The phone number to check.
   * @returns True if the phone number is empty.
   */
  private isPhoneEmpty(raw: string): boolean {
    return !raw;
  }

  /** Sets the error message for required phone field. */
  private setPhoneRequiredError(): void {
    this.phoneError = 'Phone number is required';
  }

  /**
   * Checks if the phone number starts with 0 or +.
   * @param raw - The phone number to check.
   * @returns True if the phone number starts with 0 or +.
   */
  private startsWithZeroOrPlus(raw: string): boolean {
    return /^(0|\+)/.test(raw);
  }

  /** Sets the error message for phone number prefix requirement. */
  private setPhoneStartError(): void {
    this.phoneError = 'Must start with 0 or +';
  }

  /**
   * Checks if the phone number contains only valid characters.
   * @param raw - The phone number to check.
   * @returns True if the phone number has valid characters.
   */
  private hasValidPhoneCharacters(raw: string): boolean {
    return /^[+0][0-9\s\-()]*$/.test(raw);
  }

  /** Sets the error message for invalid phone characters. */
  private setPhoneInvalidCharsError(): void {
    this.phoneError = 'Invalid characters';
  }

  /**
   * Checks if the phone number has at least 6 digits.
   * @param raw - The phone number to check.
   * @returns True if the phone number has at least 6 digits.
   */
  private hasMinimumDigits(raw: string): boolean {
    const digits = raw.replace(/\D/g, '');
    return digits.length >= 6;
  }

  /** Sets the error message for minimum digit requirement. */
  private setPhoneMinDigitsError(): void {
    this.phoneError = 'Enter at least 6 digits';
  }

  /** Clears the phone error message. */
  private clearPhoneError(): void {
    this.phoneError = null;
  }

  /**
   * Gets the dialog title based on the mode.
   * @returns 'Add contact' for add mode, 'Edit contact' for edit mode.
   */
  get title(): string {
    return this.mode === 'add' ? 'Add contact' : 'Edit contact';
  }

  /**
   * Gets the dialog subtitle based on the mode.
   * @returns Subtitle text for add mode, empty string for edit mode.
   */
  get subtitle(): string {
    return this.mode === 'add' ? 'Tasks are better with a team!' : '';
  }

  /**
   * Gets the save button text based on the mode.
   * @returns 'Create contact' for add mode, 'Save' for edit mode.
   */
  get saveButtonText(): string {
    return this.mode === 'add' ? 'Create contact' : 'Save';
  }

  /**
   * Gets the initials of the contact for display in edit mode.
   * @returns Uppercase initials if in edit mode with a contact, empty string otherwise.
   */
  get initials(): string {
    if (this.mode === 'edit' && this.contact) {
      return `${this.contact.firstName.charAt(0)}${this.contact.lastName.charAt(0)}`.toUpperCase();
    }
    return '';
  }

  /** Handles the save action by validating all fields and emitting the save event. */
  onSave(): void {
    this.validateAllFields();
    if (!this.canSubmit) return;
    this.emitSaveEvent();
  }

  /** Validates all form fields (name, email, phone). */
  private validateAllFields(): void {
    this.validateName();
    this.validateEmail();
    this.validatePhone();
  }

  /** Emits the save event with the form data.*/
  private emitSaveEvent(): void {
    this.save.emit(this.formData);
  }

  /** Emits the delete event.*/
  onDelete(): void {
    this.delete.emit();
  }

  /** Emits the close event.*/
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
}