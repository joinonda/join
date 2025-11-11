import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  private router = inject(Router);
  private authService = inject(AuthService);

  async onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    try {
      await this.authService.signIn(this.email, this.password);
      this.router.navigate(['/summary']);
    } catch (error: any) {
      this.errorMessage = this.mapAuthError(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  onGuestLogin() {
    this.authService.loginAsGuest();
    this.router.navigate(['/summary']);
  }

  onSignUp() {
    this.router.navigate(['/signup']);
  }

  private mapAuthError(code?: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Incorrect email address or password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment.';
      default:
        return 'Login failed';
    }
  }
}
