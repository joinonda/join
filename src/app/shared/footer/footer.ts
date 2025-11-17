import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

/**
 * Footer component displaying navigation menu and privacy/legal links.
 * Shows different content based on authentication state and current route.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  /** Router instance for navigation and route detection. */
  router = inject(Router);
  /** AuthService instance for checking authentication state. */
  authService = inject(AuthService);
  
  /** Computed signal indicating if user is currently logged in. */
  isLoggedIn = computed(() => this.authService.isLoggedIn());
  
  /** Signal containing the current URL, updated on route changes. */
  currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
      startWith(this.router.url)
    )
  );
  
  /** Computed signal indicating if current page is privacy policy or legal notice. */
  isPrivacyOrLegalPage = computed(() => {
    const url = this.currentUrl();
    return url === '/privacy-policy' || url === '/legal-notice';
  });
  
  /** Computed signal indicating if privacy/legal links should be shown (only when logged out). */
  showPrivacyLegal = computed(() => {
    return !this.isLoggedIn();
  });
  
  /** Computed signal indicating if navigation menu should be shown (only when logged in). */
  showMenu = computed(() => {
    return this.isLoggedIn();
  });
  
  /** Navigates to the login page. */
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
  /**
   * Returns the appropriate image source based on menu item active state.
   * @param menuName - The name of the menu item (summary, board, contacts, add-task).
   * @param defaultImg - The default image path to use when menu is not active.
   * @param activeImg - The active image path to use when menu is active.
   * @returns The image source path (active or default).
   */
  getImageSrc(menuName: string, defaultImg: string, activeImg: string): string {
    return this.isMenuActive(menuName) ? activeImg : defaultImg;
  }

  /**
   * Checks if a menu item is currently active based on the current route.
   * @param menuName - The name of the menu item to check.
   * @returns True if the menu item matches the current route, false otherwise.
   */
  private isMenuActive(menuName: string): boolean {
    const routeMap: Record<string, string> = {
      'summary': '/summary',
      'board': '/board',
      'contacts': '/contact',
      'add-task': '/add-task'
    };
    return routeMap[menuName] === this.router.url;
  }
}
