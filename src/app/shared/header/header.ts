import { Component } from '@angular/core';


@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  isLoggedIn: boolean = false;
  shouldHideAvatarOnMobileLegal: boolean = false;
  isDropdownOpen: boolean = false;
  userInitials: string = 'UU';

  toggleDropdown(event: Event): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  navigateToHelp(): void { }
  navigateToLegalNotice(): void { }
  navigateToPrivacyPolicy(): void { }
  logout(): void { }
}
