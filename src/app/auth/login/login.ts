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
  styleUrl: './login.scss'
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
      this.errorMessage = 'Bitte füllen Sie alle Felder aus';
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
        return 'Ungültige E-Mail-Adresse';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Falsche E-Mail-Adresse oder Passwort';
      case 'auth/too-many-requests':
        return 'Zu viele Versuche. Bitte warten Sie einen Moment';
      default:
        return 'Login fehlgeschlagen';
    }
  }
}
