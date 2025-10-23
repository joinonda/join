import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  activeMenu: string = 'contacts';

  setActive(menu: string): void {
    this.activeMenu = menu;
  }

  isActive(menu: string): boolean {
    return this.activeMenu === menu;
  }

  getImageSrc(menuName: string, defaultImg: string, activeImg: string): string {
    return this.isActive(menuName) ? activeImg : defaultImg;
  }
}
