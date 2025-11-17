import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

/**
 * Toast component for displaying temporary notification messages.
 * Automatically hides after a specified duration and emits close events.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class ToastComponent {
  /** Flag indicating if the toast is currently visible. */
  isVisible = false;
  /** The message text to display in the toast. */
  message = '';
  /** Output event emitter that fires when the toast is closed. */
  closed = output<void>();
  /** Subject for managing toast close events via Observable. */
  private closedSubject = new Subject<void>();
  /** Observable stream of toast close events. */
  closed$ = this.closedSubject.asObservable();

  /**
   * Displays the toast with the specified message for the given duration.
   * @param message - The message text to display in the toast.
   * @param duration - The duration in milliseconds before auto-hiding (default: 2000ms).
   */
  show(message: string, duration: number = 2000): void {
    this.message = message;
    this.isVisible = false;

    setTimeout(() => {
      this.isVisible = true;
    }, 10);

    setTimeout(() => {
      this.hide();
      this.closed.emit();
      this.closedSubject.next();
    }, duration);
  }

  /** Hides the toast by setting isVisible to false. */
  hide(): void {
    this.isVisible = false;
  }
}
