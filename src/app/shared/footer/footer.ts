import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  router = inject(Router);
  authService = inject(AuthService);
  
  isLoggedIn = computed(() => this.authService.isLoggedIn());
  
  currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
      startWith(this.router.url)
    )
  );
  
  isPrivacyOrLegalPage = computed(() => {
    const url = this.currentUrl();
    return url === '/privacy-policy' || url === '/legal-notice';
  });
  
  showPrivacyLegal = computed(() => {
    return !this.isLoggedIn();
  });
  
  showMenu = computed(() => {
    return this.isLoggedIn();
  });
  
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
  getImageSrc(menuName: string, defaultImg: string, activeImg: string): string {
    const isSummaryActive = menuName === 'summary' && this.router.url === '/summary';
    const isBoardActive = menuName === 'board' && this.router.url === '/board';
    const isContactsActive = menuName === 'contacts' && this.router.url === '/contact';
    const isAddTaskActive = menuName === 'add-task' && this.router.url === '/add-task';
    return (isSummaryActive || isBoardActive || isContactsActive || isAddTaskActive) ? activeImg : defaultImg;
  }
}
