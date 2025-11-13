import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { updateProfile } from '@angular/fire/auth';
import { Location } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class SignupComponent {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  acceptPrivacy: boolean = false;
  passwordMismatch: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;
  isSubmitted: boolean = false;

  private router = inject(Router);
  private authService = inject(AuthService);
  private firebaseService = inject(FirebaseService);

  private location = inject(Location);

  onClose(): void {
    this.location.back();
  }

  async onSignUp(signupForm: NgForm) {
    this.isSubmitted = true;

    if (signupForm.invalid) {
      this.errorMessage = 'Please correct the errors in the form.';
      return;
    }

    if (!this.acceptPrivacy) {
      this.errorMessage = 'Please accept the privacy policy.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      this.errorMessage = 'The passwords do not match.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'The password must be at least 6 characters long.';
      return;
    }

    this.passwordMismatch = false;
    this.errorMessage = '';
    this.isLoading = true;

    try {
      const cred = await this.authService.signUp(this.email, this.password);
      if (this.name && cred.user) {
        await updateProfile(cred.user, { displayName: this.name });
      }

      const nameParts = this.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await this.firebaseService.addContactToDatabase({
        firstName: firstName,
        lastName: lastName,
        email: this.email,
        phone: '',
      });

      this.router.navigate(['/summary']);
    } catch (error: any) {
      this.errorMessage = this.mapSignupError(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  onPasswordChange() {
    if (this.passwordMismatch && this.password === this.confirmPassword) {
      this.passwordMismatch = false;
      this.errorMessage = '';
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
        return 'The password must be at least 6 characters long.';
      default:
        return 'Registration failed';
    }
  }
}
