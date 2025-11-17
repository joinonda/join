import { Component, HostListener, signal, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BoardAddTaskDialog } from './board-add-task-dialog/board-add-task-dialog';

/**
 * Component for the board header section.
 * Handles search functionality, mobile detection, and add task dialog management.
 */
@Component({
  selector: 'app-board-header',
  standalone: true,
  imports: [FormsModule, BoardAddTaskDialog],
  templateUrl: './board-header.html',
  styleUrl: './board-header.scss',
})
export class BoardHeader {
  /** Router service for navigation. */
  private router = inject(Router);
  /** Signal indicating if the current viewport is mobile (width <= 1024px). */
  isMobile = signal(window.innerWidth <= 1024);
  /** Input signal for the search term. */
  searchTerm = input<string>('');
  /** Output event emitter for search term changes. */
  searchTermChange = output<string>();
  /** Indicates if search has results. */
  hasSearchResults: boolean = true;
  /** Signal indicating if the add task dialog is open. */
  isAddTaskDialogOpen = signal(false);

  /**
   * Initializes the component and updates mobile state.
   */
  constructor() {
    this.updateIsMobile();
  }

  /**
   * Handles window resize events.
   * Updates mobile state and closes dialog on mobile if open.
   */
  @HostListener('window:resize')
  onResize() {
    this.updateIsMobile();
    if (this.isMobile() && this.isAddTaskDialogOpen()) {
      this.isAddTaskDialogOpen.set(false);
    }
  }

  /**
   * Updates the mobile state based on current window width.
   */
  private updateIsMobile() {
    this.isMobile.set(window.innerWidth <= 1024);
  }

  /**
   * Performs a search with the current search term.
   * Trims the search term and emits it via searchTermChange output.
   */
  performSearch(): void {
    const term = this.searchTerm().trim();
    this.searchTermChange.emit(term);
    this.hasSearchResults = true;
  }

  /**
   * Handles search input changes.
   * Emits the current input value via searchTermChange output.
   * @param event - The input event from the search field.
   */
  onSearchInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTermChange.emit(term);
  }

  /**
   * Opens the add task component or dialog.
   * Navigates to add-task route on mobile, opens dialog on desktop.
   */
  openAddTaskComponent(): void {
    if (this.isMobile()) {
      this.router.navigate(['/add-task']);
    } else {
      this.isAddTaskDialogOpen.set(true);
    }
  }

  /**
   * Opens the add task overlay or navigates to add task page.
   * Navigates to add-task route on mobile, opens dialog on desktop.
   */
  openAddTaskOverlay(): void {
    if (this.isMobile()) {
      this.router.navigate(['/add-task']);
    } else {
      this.isAddTaskDialogOpen.set(true);
    }
  }

  /**
   * Handles the dialog closed event.
   * Closes the add task dialog.
   */
  onDialogClosed(): void {
    this.isAddTaskDialogOpen.set(false);
  }
}
