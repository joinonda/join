import { Component, inject, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
  
  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  errorMessage = signal('');
  emailError = signal('');
  passwordError = signal('');
  isLoading = signal(false);
  showPassword = signal(false);
  isPasswordFocused = signal(false);

  private router = inject(Router);
  private authService = inject(AuthService);

  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isPasswordFocused()) {
      this.showPassword.update(v => !v);
      setTimeout(() => this.passwordInput?.nativeElement.focus(), 0);
    }
  }

  onPasswordFocus = () => this.isPasswordFocused.set(true);

  onPasswordBlur(): void {
    setTimeout(() => {
      if (!this.passwordInput?.nativeElement.matches(':focus')) {
        this.isPasswordFocused.set(false);
        this.showPassword.set(false);
      }
    }, 150);
  }

  onEmailInput = (value: string) => {
    this.email.set(value);
    if (this.emailError()) {
      this.emailError.set('');
      this.errorMessage.set('');
    }
  };

  private validateEmail(): boolean {
    const email = this.email().trim();
    if (!email) return true;
    const isValid = this.EMAIL_REGEX.test(email);
    this.emailError.set(isValid ? '' : 'Please enter a valid email address.');
    return isValid;
  }

  onEmailBlur = () => this.validateEmail();

  onPasswordInput = (value: string) => {
    this.password.set(value);
    if (this.passwordError()) {
      this.passwordError.set('');
      this.errorMessage.set('');
    }
  };

  private clearErrors(): void {
    this.errorMessage.set('');
    this.emailError.set('');
    this.passwordError.set('');
  }

  private navigateAfterLogin(): void {
    this.router.navigate([window.innerWidth > 1024 ? '/summary' : '/greeting']);
  }

  async onLogin(form: NgForm): Promise<void> {
    form.control.markAllAsTouched();
    if (form.invalid || !this.validateEmail()) {
      this.errorMessage.set('Please correct the highlighted fields.');
      return;
    }

    this.clearErrors();
    this.isLoading.set(true);

    try {
      await this.authService.signIn(this.email(), this.password());
      this.navigateAfterLogin();
    } catch (error: any) {
      const { message, emailError, passwordError } = this.mapAuthError(error.code, this.email());
      this.errorMessage.set(message);
      this.emailError.set(emailError || '');
      this.passwordError.set(passwordError || '');
    } finally {
      this.isLoading.set(false);
    }
  }

  onGuestLogin = () => {
    this.authService.loginAsGuest();
    this.navigateAfterLogin();
  };

  onSignUp = () => this.router.navigate(['/signup']);

  private mapAuthError(code?: string, email?: string) {
    const invalidCredential = email && this.EMAIL_REGEX.test(email)
      ? { message: 'Incorrect email address or password', emailError: 'Incorrect email address or password' }
      : { message: 'Invalid email address', emailError: 'Please enter a valid email address.' };

    const errors: Record<string, { message: string; emailError?: string; passwordError?: string }> = {
      'auth/invalid-email': { message: 'Invalid email address', emailError: 'Please enter a valid email address.' },
      'auth/user-not-found': { message: 'Incorrect email address or password', emailError: 'No account found with this email address.' },
      'auth/wrong-password': { message: 'Incorrect email address or password', passwordError: 'The password is incorrect.' },
      'auth/invalid-credential': invalidCredential,
      'auth/too-many-requests': { message: 'Too many attempts. Please wait a moment.' }
    };

    return errors[code || ''] || { message: 'Login failed. Please try again.' };
  }
}
