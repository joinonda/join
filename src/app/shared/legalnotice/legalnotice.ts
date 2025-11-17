import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';

/**
 * Legal notice component displaying legal information and terms.
 * Provides functionality to close the legal notice view by navigating back.
 */
@Component({
  selector: 'app-legalnotice',
  standalone: true,
  imports: [],
  templateUrl: './legalnotice.html',
  styleUrl: './legalnotice.scss',
})
export class Legalnotice {
  /** Location service for browser history navigation. */
  private location = inject(Location);

  /** Closes the legal notice view by navigating back in browser history. */
  onClose(): void {
    this.location.back();
  }
}
