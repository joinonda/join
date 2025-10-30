import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board-header',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './board-header.html',
  styleUrl: './board-header.scss',
})
export class BoardHeader {
  isMobile: boolean = false;
  searchTerm: string = '';
  hasSearchResults: boolean = true;

  constructor(private router: Router) {
    this.updateIsMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateIsMobile();
  }

  private updateIsMobile() {
    this.isMobile = window.innerWidth < 1024;
  }

  performSearch(): void {
    const term = this.searchTerm.trim();
    this.hasSearchResults = true;
  }

  openAddTaskComponent(): void {
    this.router.navigateByUrl('/addTask');
  }

  openAddTaskOverlay(status: string): void {
    this.router.navigate(['/addTask'], { queryParams: { status } });
  }
}
