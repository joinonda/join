import { Component, inject, ViewChild, ElementRef, signal, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { updateProfile } from '@angular/fire/auth';
import { Location } from '@angular/common';
import { ToastComponent } from '../../shared/toast/toast';

/**
 * Component for user registration/signup functionality.
 * Handles form validation, user creation, profile updates, and navigation.
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastComponent],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss', './signup-mobile.scss'],
})
export class SignupComponent {
  /** Reference to the toast component for displaying success messages. */
  @ViewChild(ToastComponent) toast!: ToastComponent;
  /** Reference to the password input element. */
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
  /** Reference to the confirm password input element. */
  @ViewChild('confirmPasswordInput') confirmPasswordInput!: ElementRef<HTMLInputElement>;

  /** User's full name signal. */
  name = signal('');
  /** User's email address signal. */
  email = signal('');
  /** User's password signal. */
  password = signal('');
  /** Confirmation password signal. */
  confirmPassword = signal('');
  /** Privacy policy acceptance signal. */
  acceptPrivacy = signal(false);
  /** Indicates if passwords do not match. */
  passwordMismatch = signal(false);
  /** Error message to display to the user. */
  errorMessage = signal('');
  /** Loading state during signup process. */
  isLoading = signal(false);
  /** Controls password field visibility. */
  showPassword = signal(false);
  /** Controls confirm password field visibility. */
  showConfirmPassword = signal(false);
  /** Indicates if password field is focused. */
  isPasswordFocused = signal(false);
  /** Indicates if confirm password field is focused. */
  isConfirmPasswordFocused = signal(false);

  /** Router service for navigation. */
  private router = inject(Router);
  /** Authentication service for user registration. */
  private authService = inject(AuthService);
  /** Firebase service for database operations. */
  private firebaseService = inject(FirebaseService);
  /** Location service for browser history navigation. */
  private location = inject(Location);
  /** Injector for running code within Angular injection context. */
  private injector = inject(Injector);

  /**
   * Toggles the visibility of the password field.
   * @param event - The click event from the visibility toggle button.
   */
  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isPasswordFocused()) {
      this.showPassword.update(v => !v);
      setTimeout(() => {
        this.passwordInput?.nativeElement.focus();
      }, 0);
    }
  }

  /**
   * Toggles the visibility of the confirm password field.
   * @param event - The click event from the visibility toggle button.
   */
  toggleConfirmPasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isConfirmPasswordFocused()) {
      this.showConfirmPassword.update(v => !v);
      setTimeout(() => {
        this.confirmPasswordInput?.nativeElement.focus();
      }, 0);
    }
  }

  /**
   * Sets the password field as focused.
   */
  onPasswordFocus = () => this.isPasswordFocused.set(true);

  /**
   * Handles blur event on password field.
   * Hides password visibility if field is no longer focused.
   */
  onPasswordBlur(): void {
    setTimeout(() => {
      if (!this.passwordInput?.nativeElement.matches(':focus')) {
        this.isPasswordFocused.set(false);
        this.showPassword.set(false);
      }
    }, 150);
  }

  /**
   * Sets the confirm password field as focused.
   */
  onConfirmPasswordFocus = () => this.isConfirmPasswordFocused.set(true);

  /**
   * Handles blur event on confirm password field.
   * Hides password visibility if field is no longer focused.
   */
  onConfirmPasswordBlur(): void {
    setTimeout(() => {
      if (!this.confirmPasswordInput?.nativeElement.matches(':focus')) {
        this.isConfirmPasswordFocused.set(false);
        this.showConfirmPassword.set(false);
      }
    }, 150);
  }

  /**
   * Closes the signup form and navigates back.
   */
  onClose(): void {
    this.location.back();
  }

  /**
   * Handles the signup form submission.
   * Validates form, performs registration, and handles errors.
   * @param form - The Angular form instance.
   */
  async onSignUp(form: NgForm) {
    if (!this.isFormValid(form)) return;

    this.resetErrors();
    this.isLoading.set(true);

    try {
      await this.processSignUp();
    } catch (error: any) {
      this.handleSignupError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Processes the complete signup flow.
   * Creates user account, updates profile, adds contact, and navigates to login.
   * @returns Promise that resolves when signup is complete.
   */
  private async processSignUp(): Promise<void> {
    const cred = await this.performSignUp();
    this.showSuccessToast();
    await this.updateUserProfile(cred);
    await this.addContactToDatabase();
    this.navigateToLogin();
  }

  /**
   * Validates the signup form.
   * @param form - The Angular form instance to validate.
   * @returns True if form is valid, false otherwise.
   */
  private isFormValid(form: NgForm): boolean {
    if (form.invalid || this.passwordMismatch()) {
      form.control.markAllAsTouched();
      this.errorMessage.set('Please correct the highlighted fields.');
      return false;
    }
    return true;
  }

  /**
   * Resets all error states.
   */
  private resetErrors(): void {
    this.passwordMismatch.set(false);
    this.errorMessage.set('');
  }

  /**
   * Performs the user registration via authentication service.
   * @returns Promise resolving to the user credentials.
   */
  private async performSignUp() {
    return await this.authService.signUp(this.email(), this.password());
  }

  /**
   * Displays a success toast message after successful registration.
   */
  private showSuccessToast(): void {
    this.toast.show('You Signed Up successfully', 1500);
  }

  /**
   * Updates the user profile with the display name.
   * @param cred - The user credentials from Firebase authentication.
   * @returns Promise that resolves when profile update is complete.
   */
  private async updateUserProfile(cred: any): Promise<void> {
    if (this.name() && cred.user) {
      runInInjectionContext(this.injector, () => {
        updateProfile(cred.user, { displayName: this.name() }).catch(() => {});
      });
    }
  }

  /**
   * Adds the new user as a contact to the database.
   * @returns Promise that resolves when contact is added.
   */
  private async addContactToDatabase(): Promise<void> {
    const { firstName, lastName } = this.parseName();
    this.firebaseService.addContactToDatabase({
      firstName,
      lastName,
      email: this.email(),
      phone: '',
    }).catch(() => {});
  }

  /**
   * Parses the full name into first and last name.
   * @returns Object containing firstName and lastName.
   */
  private parseName() {
    const nameParts = this.name().trim().split(' ');
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
    };
  }

  /**
   * Navigates to the login page after a delay.
   */
  private navigateToLogin(): void {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }

  /**
   * Handles signup errors and displays appropriate error messages.
   * @param error - The error object from Firebase authentication.
   */
  private handleSignupError(error: any): void {
    this.errorMessage.set(this.mapSignupError(error.code));
  }

  /**
   * Handles password input changes and checks for mismatch.
   * @param value - The new password value.
   */
  onPasswordInput = (value: string) => {
    this.password.set(value);
    this.checkPasswordMismatch();
  };

  /**
   * Handles confirm password input changes and checks for mismatch.
   * @param value - The new confirm password value.
   */
  onConfirmPasswordInput = (value: string) => {
    this.confirmPassword.set(value);
    this.checkPasswordMismatch();
  };

  /**
   * Checks if password and confirm password fields match.
   * Clears password-related error messages if passwords match.
   */
  private checkPasswordMismatch(): void {
    const password = this.password();
    const confirmPassword = this.confirmPassword();
    this.passwordMismatch.set(
      !!password && !!confirmPassword && password !== confirmPassword
    );

    if (!this.passwordMismatch()) {
      if (this.errorMessage()?.toLowerCase().includes('password')) {
        this.errorMessage.set('');
      }
    }
  }

  /**
   * Navigates back to the login page.
   */
  goBack() {
    this.router.navigate(['/login']);
  }

  /**
   * Maps Firebase error codes to user-friendly error messages.
   * @param code - The Firebase error code.
   * @returns User-friendly error message string.
   */
  private mapSignupError(code?: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email address is already in use.';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      default:
        return 'Registration failed';
    }
  }
}
