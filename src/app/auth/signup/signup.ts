import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class Signup {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  acceptPrivacy: boolean = false;
  passwordMismatch: boolean = false;

  constructor(private router: Router) {}

  onSignUp() {
    // Check if passwords match
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
    
    this.passwordMismatch = false;
    console.log('Sign up attempt:', { 
      name: this.name, 
      email: this.email, 
      acceptPrivacy: this.acceptPrivacy 
    });
    // TODO: Implement sign up logic
  }

  onPasswordChange() {
    // Reset error when user types
    if (this.passwordMismatch && this.password === this.confirmPassword) {
      this.passwordMismatch = false;
    }
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}