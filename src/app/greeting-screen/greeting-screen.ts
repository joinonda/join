import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Component displaying a personalized greeting screen on mobile devices.
 * Shows time-based greeting and user name, then navigates to summary after a delay.
 * On desktop, redirects immediately to summary page.
 */
@Component({
  selector: 'app-greeting-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './greeting-screen.html',
  styleUrl: './greeting-screen.scss',
})
export class GreetingScreen implements OnInit {
  /** Router service for navigation. */
  private router = inject(Router);
  /** AuthService for user authentication and user data. */
  private authService = inject(AuthService);

  /** The greeting text based on time of day (Good Morning/Afternoon/Evening). */
  greetingText: string = '';
  /** The user's name or email username to display. */
  userName: string = '';
  /** Flag indicating if the fade-out animation should start. */
  isFadingOut: boolean = false;

  /**
   * Initializes the component and handles desktop/mobile logic.
   * On desktop, redirects immediately. On mobile, sets up greeting and navigation.
   */
  ngOnInit(): void {
    if (this.isDesktop()) {
      this.redirectToSummary();
      return;
    }

    this.initializeGreeting();
    this.startFadeOut();
    this.navigateAfterDelay();
  }

  /**
   * Checks if the current viewport is desktop size.
   * @returns True if window width is greater than 1024px.
   */
  private isDesktop(): boolean {
    return window.innerWidth > 1024;
  }

  /** Redirects to the summary page immediately (desktop behavior). */
  private redirectToSummary(): void {
    this.router.navigate(['/summary'], { skipLocationChange: false });
  }

  /** Initializes the greeting text and user name for display. */
  private initializeGreeting(): void {
    this.setGreeting();
    this.setUserName();
  }

  /** Starts the fade-out animation after 2 seconds. */
  private startFadeOut(): void {
    setTimeout(() => {
      this.isFadingOut = true;
    }, 2000);
  }

  /** Navigates to summary page after 2.5 seconds with a query parameter. */
  private navigateAfterDelay(): void {
    setTimeout(() => {
      this.router.navigate(['/summary'], { queryParams: { fromGreeting: 'true' }, skipLocationChange: false });
    }, 2500);
  }

  /**
   * Sets the greeting text based on the current time of day.
   * Morning: before 12:00, Afternoon: 12:00-18:00, Evening: after 18:00.
   */
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

  /**
   * Sets the user name from authentication service.
   * Uses display name, email username, or empty string for guests.
   */
  private setUserName(): void {
    if (this.isGuest()) {
      this.userName = '';
      return;
    }
    this.userName = this.getUserNameFromUser();
  }

  /**
   * Checks if the current user is a guest.
   * @returns True if the user is a guest.
   */
  private isGuest(): boolean {
    return this.authService.isGuest();
  }

  /**
   * Gets the user name from the current user object.
   * Prioritizes display name, falls back to email username.
   * @returns The user's display name, email username, or empty string.
   */
  private getUserNameFromUser(): string {
    const user = this.authService.getCurrentUser();
    if (user?.displayName) {
      return user.displayName;
    }
    if (user?.email) {
      return this.extractNameFromEmail(user.email);
    }
    return '';
  }

  /**
   * Extracts the username part from an email address.
   * @param email - The email address to extract from.
   * @returns The part before the @ symbol.
   */
  private extractNameFromEmail(email: string): string {
    return email.split('@')[0];
  }
}

