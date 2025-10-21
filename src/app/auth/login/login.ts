import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;

  constructor(private router: Router) {}

  onLogin() {
    console.log('Login attempt:', { email: this.email, password: this.password, rememberMe: this.rememberMe });
    // TODO: Implement login logic
  }

  onGuestLogin() {
    console.log('Guest login');
    // TODO: Implement guest login logic
  }

  onSignUp() {
    this.router.navigate(['/signup']);
  }
}