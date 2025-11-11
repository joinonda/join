import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({ selector: 'app-login', standalone: true, templateUrl: './login.html' })
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit(email: string, password: string) {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.auth.signIn(email, password);
      this.router.navigate(['/app']);
    } catch (e: any) {
      this.error.set(mapAuthError(e.code));
    } finally {
      this.loading.set(false);
    }
  }
}

function mapAuthError(code?: string) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Incorrect email address or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment.';
    default:
      return 'Login failed.';
  }
}
