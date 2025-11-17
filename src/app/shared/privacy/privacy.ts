import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Privacy policy component displaying privacy information and data protection details.
 * Provides functionality to close the privacy policy view by navigating back.
 */
@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class Privacy {
  /** Location service for browser history navigation. */
  private location = inject(Location);

  /** Closes the privacy policy view by navigating back in browser history. */
  onClose(): void {
    this.location.back();
  }
}
