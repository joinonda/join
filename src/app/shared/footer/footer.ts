import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
