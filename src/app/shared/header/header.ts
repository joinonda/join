import { Component, inject, computed, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  shouldHideAvatarOnMobileLegal: boolean = false;
  isDropdownOpen: boolean = false;

  isLoggedIn = computed(() => this.authService.isLoggedIn());
  userInitials = computed(() => this.authService.getUserInitials());

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.isDropdownOpen && !target.closest('.avatar-container')) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigateToHelp(): void {
    this.router.navigate(['/help']);
  }
  navigateToLegalNotice(): void {
    this.router.navigate(['/legal-notice']);
  }
  navigateToPrivacyPolicy(): void {
    this.router.navigate(['/privacy-policy']);
  }

  logout(): void {
    this.authService.signOut();
    this.isDropdownOpen = false;
  }
}
