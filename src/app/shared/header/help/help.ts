import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Help component displaying help information in a modal/dialog.
 * Provides functionality to close the help view by navigating back.
 */
@Component({
  selector: 'app-help',
  standalone: true,
  imports: [],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})
export class Help {
  /** Location service for browser history navigation. */
  private location = inject(Location);

  /** Closes the help view by navigating back in browser history. */
  onClose(): void {
    this.location.back();
  }
}
