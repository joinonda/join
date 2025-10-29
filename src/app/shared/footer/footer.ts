import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  router = inject(Router);
  
  getImageSrc(menuName: string, defaultImg: string, activeImg: string): string {
    const isBoardActive = menuName === 'board' && this.router.url === '/board';
    const isContactsActive = menuName === 'contacts' && this.router.url === '/contact';
    const isAddTaskActive = menuName === 'add-task' && this.router.url === '/add-task';
    return (isBoardActive || isContactsActive || isAddTaskActive) ? activeImg : defaultImg;
  }
}
