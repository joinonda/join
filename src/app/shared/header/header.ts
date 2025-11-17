import { Component, inject, computed, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Header component displaying navigation, user avatar, and dropdown menu.
 * Handles authentication state, user initials, and navigation to various pages.
 */
@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  /** AuthService instance for authentication operations. */
  private authService = inject(AuthService);
  /** Router instance for navigation. */
  private router = inject(Router);

  /** Flag to hide avatar on mobile legal pages. */
  shouldHideAvatarOnMobileLegal: boolean = false;
  /** Flag indicating if the user dropdown menu is currently open. */
  isDropdownOpen: boolean = false;

  /** Computed signal indicating if user is currently logged in. */
  isLoggedIn = computed(() => this.authService.isLoggedIn());
  /** Computed signal containing the user's initials for avatar display. */
  userInitials = computed(() => this.authService.getUserInitials());

  /**
   * Handles document click events to close dropdown when clicking outside.
   * @param event - The mouse event from the document click.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isDropdownOpen && !target.closest('.avatar-container')) {
      this.isDropdownOpen = false;
    }
  }

  /**
   * Toggles the dropdown menu open/closed state.
   * @param event - The click event that triggered the toggle.
   */
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /** Navigates to the help page and closes the dropdown menu. */
  navigateToHelp(): void {
    this.router.navigate(['/help']);
    this.closeDropdown();
  }

  /** Navigates to the legal notice page and closes the dropdown menu. */
  navigateToLegalNotice(): void {
    this.router.navigate(['/legal-notice']);
    this.closeDropdown();
  }

  /** Navigates to the privacy policy page and closes the dropdown menu. */
  navigateToPrivacyPolicy(): void {
    this.router.navigate(['/privacy-policy']);
    this.closeDropdown();
  }

  /** Logs out the current user and closes the dropdown menu. */
  logout(): void {
    this.authService.signOut();
    this.closeDropdown();
  }

  /** Closes the dropdown menu by setting isDropdownOpen to false. */
  private closeDropdown(): void {
    this.isDropdownOpen = false;
  }
}
