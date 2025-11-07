import { Component, HostListener, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BoardAddTaskDialog } from './board-add-task-dialog/board-add-task-dialog';

@Component({
  selector: 'app-board-header',
  standalone: true,
  imports: [FormsModule, BoardAddTaskDialog],
  templateUrl: './board-header.html',
  styleUrl: './board-header.scss',
})
export class BoardHeader {
  private router = inject(Router);
  isMobile = signal(window.innerWidth <= 1024);
  searchTerm: string = '';
  hasSearchResults: boolean = true;
  isAddTaskDialogOpen = signal(false);

  constructor() {
    this.updateIsMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateIsMobile();
    if (this.isMobile() && this.isAddTaskDialogOpen()) {
      this.isAddTaskDialogOpen.set(false);
    }
  }

  private updateIsMobile() {
    this.isMobile.set(window.innerWidth <= 1024);
  }

  performSearch(): void {
    const term = this.searchTerm.trim();
    this.hasSearchResults = true;
  }

  openAddTaskComponent(): void {
    if (this.isMobile()) {
      this.router.navigate(['/add-task']);
    } else {
      this.isAddTaskDialogOpen.set(true);
    }
  }

  openAddTaskOverlay(): void {
    if (this.isMobile()) {
      this.router.navigate(['/add-task']);
    } else {
      this.isAddTaskDialogOpen.set(true);
    }
  }

  onDialogClosed(): void {
    this.isAddTaskDialogOpen.set(false);
  }
}
