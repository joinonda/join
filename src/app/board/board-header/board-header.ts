import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardAddTaskDialog } from './board-add-task-dialog/board-add-task-dialog';

@Component({
  selector: 'app-board-header',
  standalone: true,
  imports: [FormsModule, BoardAddTaskDialog],
  templateUrl: './board-header.html',
  styleUrl: './board-header.scss',
})
export class BoardHeader {
  isMobile: boolean = false;
  searchTerm: string = '';
  hasSearchResults: boolean = true;
  isAddTaskDialogOpen = signal(false);

  constructor() {
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
    this.isAddTaskDialogOpen.set(true);
  }

  openAddTaskOverlay(): void {
    this.isAddTaskDialogOpen.set(true);
  }

  onDialogClosed(): void {
    this.isAddTaskDialogOpen.set(false);
  }
}
