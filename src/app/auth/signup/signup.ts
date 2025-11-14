import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { updateProfile } from '@angular/fire/auth';
import { Location } from '@angular/common';
import { ToastComponent } from '../../shared/toast/toast';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ToastComponent],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  @ViewChild(ToastComponent) toast!: ToastComponent;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;
  @ViewChild('confirmPasswordInput') confirmPasswordInput!: ElementRef<HTMLInputElement>;
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  acceptPrivacy: boolean = false;
  passwordMismatch: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isPasswordFocused: boolean = false;
  isConfirmPasswordFocused: boolean = false;

  private router = inject(Router);
  private authService = inject(AuthService);
  private firebaseService = inject(FirebaseService);

  private location = inject(Location);

  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isPasswordFocused) {
      this.showPassword = !this.showPassword;
      setTimeout(() => {
        this.passwordInput?.nativeElement.focus();
      }, 0);
    }
  }

  toggleConfirmPasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isConfirmPasswordFocused) {
      this.showConfirmPassword = !this.showConfirmPassword;
      setTimeout(() => {
        this.confirmPasswordInput?.nativeElement.focus();
      }, 0);
    }
  }

  onPasswordFocus(): void {
    this.isPasswordFocused = true;
  }

  onPasswordBlur(): void {
    setTimeout(() => {
      if (!this.passwordInput?.nativeElement.matches(':focus')) {
        this.isPasswordFocused = false;
        this.showPassword = false;
      }
    }, 150);
  }

  onConfirmPasswordFocus(): void {
    this.isConfirmPasswordFocused = true;
  }

  onConfirmPasswordBlur(): void {
    setTimeout(() => {
      if (!this.confirmPasswordInput?.nativeElement.matches(':focus')) {
        this.isConfirmPasswordFocused = false;
        this.showConfirmPassword = false;
      }
    }, 150);
  }

  onClose(): void {
    this.location.back();
  }

  async onSignUp(form: NgForm) {
    if (form.invalid || this.passwordMismatch) {
      form.control.markAllAsTouched();
      this.errorMessage = 'Please correct the highlighted fields.';
      return;
    }

    this.passwordMismatch = false;
    this.errorMessage = '';
    this.isLoading = true;

    try {
      const cred = await this.authService.signUp(this.email, this.password);

      this.toast.show('You Signed Up successfully', 1500);

      if (this.name && cred.user) {
        updateProfile(cred.user, { displayName: this.name }).catch(() => {});
      }

      const nameParts = this.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      this.firebaseService.addContactToDatabase({
        firstName,
        lastName,
        email: this.email,
        phone: '',
      }).catch(() => {});


      setTimeout(() => {
        if (window.innerWidth > 1024) {
          this.router.navigate(['/summary']);
        } else {
          this.router.navigate(['/greeting']);
        }
      }, 2500);
    } catch (error: any) {
      this.errorMessage = this.mapSignupError(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  onPasswordChange() {
    this.passwordMismatch =
      !!this.password && !!this.confirmPassword && this.password !== this.confirmPassword;

    if (!this.passwordMismatch) {
      if (this.errorMessage?.toLowerCase().includes('password')) {
        this.errorMessage = '';
      }
    }
  }

  goBack() {
    this.router.navigate(['/login']);
  }

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
