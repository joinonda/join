import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-greeting-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './greeting-screen.html',
  styleUrl: './greeting-screen.scss',
})
export class GreetingScreen implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  greetingText: string = '';
  userName: string = '';
  isFadingOut: boolean = false;

  ngOnInit(): void {
    if (window.innerWidth > 1024) {
      this.router.navigate(['/summary'], { skipLocationChange: false });
      return;
    }

    this.setGreeting();
    this.setUserName();
    
    setTimeout(() => {
      this.isFadingOut = true;
    }, 2000);

    setTimeout(() => {
      this.router.navigate(['/summary'], { queryParams: { fromGreeting: 'true' }, skipLocationChange: false });
    }, 2500);
  }

  private setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greetingText = 'Good Morning';
    } else if (hour < 18) {
      this.greetingText = 'Good Afternoon';
    } else {
      this.greetingText = 'Good Evening';
    }
  }

  private setUserName(): void {
    if (this.authService.isGuest()) {
      this.userName = '';
    } else {
      const user = this.authService.getCurrentUser();
      if (user?.displayName) {
        this.userName = user.displayName;
      } else if (user?.email) {
        this.userName = user.email.split('@')[0];
      } else {
        this.userName = '';
      }
    }
  }
}

