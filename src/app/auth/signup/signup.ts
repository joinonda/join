import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { sendEmailVerification, updateProfile } from '@angular/fire/auth';

@Component({ selector: 'app-signup', standalone: true, templateUrl: './signup.html' })
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit(name: string, email: string, password: string, repeat: string) {
    if (password !== repeat) {
      this.error.set('Passwörter stimmen nicht.');
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    try {
      const cred = await this.auth.signUp(email, password);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
      this.router.navigate(['/verify-email']);
    } catch (e: any) {
      this.error.set(mapSignupError(e.code));
    } finally {
      this.loading.set(false);
    }
  }
}

function mapSignupError(code?: string) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email already registered.';
    case 'auth/invalid-email':
      return 'Invalid email.';
    case 'auth/weak-password':
      return 'Password too weak (at least 6 characters).';
    default:
      return 'Registration failed.';
  }
}
