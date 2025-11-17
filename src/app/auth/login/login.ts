import { Component, inject, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Component for user login functionality.
 * Handles authentication, form validation, and error handling.
 *
 * @component
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss', './login-mobile.scss'],
})
export class LoginComponent {
  /** Reference to the password input element. */
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  /** Signal containing the email input value. */
  email = signal('');

  /** Signal containing the password input value. */
  password = signal('');

  /** Signal indicating whether the "Remember me" checkbox is checked. */
  rememberMe = signal(false);

  /** Signal containing the general error message. */
  errorMessage = signal('');

  /** Signal containing the email-specific error message. */
  emailError = signal('');

  /** Signal containing the password-specific error message. */
  passwordError = signal('');

  /** Signal indicating whether a login request is in progress. */
  isLoading = signal(false);

  /** Signal indicating whether the password should be visible. */
  showPassword = signal(false);

  /** Signal indicating whether the password input field is focused. */
  isPasswordFocused = signal(false);

  /** Router instance for navigation. */
  private router = inject(Router);

  /** AuthService instance for authentication operations. */
  private authService = inject(AuthService);

  /** Regular expression for validating email format. */
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Toggles the password visibility when the visibility icon is clicked.
   * Only works when the password field is focused.
   *
   * @param {Event} event - The mouse event from clicking the visibility icon.
   */
  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isPasswordFocused()) {
      this.showPassword.update(v => !v);
      setTimeout(() => this.passwordInput?.nativeElement.focus(), 0);
    }
  }

  /**
   * Handles the focus event on the password input field.
   * Sets the password focused state to true.
   */
  onPasswordFocus = () => this.isPasswordFocused.set(true);

  /**
   * Handles the blur event on the password input field.
   * Resets the password focused state and hides the password after a delay.
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
   * Handles email input changes and clears email errors when user types.
   *
   * @param {string} value - The new email value from the input.
   */
  onEmailInput = (value: string) => {
    this.email.set(value);
    if (this.emailError()) {
      this.emailError.set('');
      this.errorMessage.set('');
    }
  };

  /**
   * Validates the email format using regex.
   * Sets email error message if validation fails.
   *
   * @private
   * @returns {boolean} True if email is valid or empty, false otherwise.
   */
  private validateEmail(): boolean {
    const email = this.email().trim();
    if (!email) return true;
    const isValid = this.EMAIL_REGEX.test(email);
    this.emailError.set(isValid ? '' : 'Please enter a valid email address.');
    return isValid;
  }

  /**
   * Handles the blur event on the email input field.
   * Triggers email validation when the field loses focus.
   */
  onEmailBlur = () => this.validateEmail();

  /**
   * Handles password input changes and clears password errors when user types.
   *
   * @param {string} value - The new password value from the input.
   */
  onPasswordInput = (value: string) => {
    this.password.set(value);
    if (this.passwordError()) {
      this.passwordError.set('');
      this.errorMessage.set('');
    }
  };

  /**
   * Clears all error messages (general, email, and password).
   *
   * @private
   */
  private clearErrors(): void {
    this.errorMessage.set('');
    this.emailError.set('');
    this.passwordError.set('');
  }

  /**
   * Navigates to the appropriate page after successful login.
   * Routes to summary page on desktop, greeting page on mobile.
   *
   * @private
   */
  private navigateAfterLogin(): void {
    this.router.navigate([window.innerWidth > 1024 ? '/summary' : '/greeting']);
  }

  /**
   * Handles the login form submission.
   * Validates the form, performs authentication, and handles errors.
   *
   * @param {NgForm} form - The Angular form instance.
   */
  async onLogin(form: NgForm): Promise<void> {
    if (!this.isFormValid(form)) return;

    this.clearErrors();
    this.isLoading.set(true);

    try {
      await this.performLogin();
      this.navigateAfterLogin();
    } catch (error: any) {
      this.handleLoginError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Validates the login form and marks all fields as touched.
   * Sets error message if validation fails.
   *
   * @private
   * @param {NgForm} form - The Angular form instance to validate.
   * @returns {boolean} True if form is valid, false otherwise.
   */
  private isFormValid(form: NgForm): boolean {
    form.control.markAllAsTouched();
    if (form.invalid || !this.validateEmail()) {
      this.errorMessage.set('Please correct the highlighted fields.');
      return false;
    }
    return true;
  }

  /**
   * Performs the actual login authentication via AuthService.
   *
   * @private
   */
  private async performLogin(): Promise<void> {
    await this.authService.signIn(this.email(), this.password());
  }

  /**
   * Handles login errors by mapping Firebase error codes to user-friendly messages.
   * Sets appropriate error messages for email and password fields.
   *
   * @private
   * @param {any} error - The error object from the authentication attempt.
   */
  private handleLoginError(error: any): void {
    const { message, emailError, passwordError } = this.mapAuthError(error.code, this.email());
    this.errorMessage.set(message);
    this.emailError.set(emailError || '');
    this.passwordError.set(passwordError || '');
  }

  /**
   * Handles guest login functionality.
   * Logs in as guest and navigates to the appropriate page.
   */
  onGuestLogin = () => {
    this.authService.loginAsGuest();
    this.navigateAfterLogin();
  };

  /**
   * Navigates to the signup page.
   */
  onSignUp = () => this.router.navigate(['/signup']);

  /**
   * Maps Firebase authentication error codes to user-friendly error messages.
   *
   * @private
   * @param {string} [code] - The Firebase error code.
   * @param {string} [email] - The email address used in the login attempt.
   * @returns {{ message: string; emailError?: string; passwordError?: string }} Error object with message and field-specific errors.
   */
  private mapAuthError(code?: string, email?: string) {
    const invalidCredential = this.getInvalidCredentialError(email);
    const errors = this.getErrorMap(invalidCredential);
    return errors[code || ''] || { message: 'Login failed. Please try again.' };
  }

  /**
   * Gets the appropriate error message for invalid credential errors.
   * Differentiates between invalid email format and incorrect credentials.
   *
   * @private
   * @param {string} [email] - The email address to validate.
   * @returns {{ message: string; emailError: string }} Error object for invalid credentials.
   */
  private getInvalidCredentialError(email?: string) {
    return email && this.EMAIL_REGEX.test(email)
      ? { message: 'Incorrect email address or password', emailError: 'Incorrect email address or password' }
      : { message: 'Invalid email address', emailError: 'Please enter a valid email address.' };
  }

  /**
   * Creates a map of Firebase error codes to error message objects.
   *
   * @private
   * @param {{ message: string; emailError?: string }} invalidCredential - The error object for invalid credentials.
   * @returns {Record<string, { message: string; emailError?: string; passwordError?: string }>} Map of error codes to error objects.
   */
  private getErrorMap(invalidCredential: { message: string; emailError?: string }): Record<string, { message: string; emailError?: string; passwordError?: string }> {
    return {
      'auth/invalid-email': { message: 'Invalid email address', emailError: 'Please enter a valid email address.' },
      'auth/user-not-found': { message: 'Incorrect email address or password', emailError: 'No account found with this email address.' },
      'auth/wrong-password': { message: 'Incorrect email address or password', passwordError: 'The password is incorrect.' },
      'auth/invalid-credential': invalidCredential,
      'auth/too-many-requests': { message: 'Too many attempts. Please wait a moment.' }
    };
  }
}
