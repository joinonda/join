import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class ToastComponent {
  isVisible = false;
  message = '';
  closed = output<void>();
  private closedSubject = new Subject<void>();
  closed$ = this.closedSubject.asObservable();

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

  hide(): void {
    this.isVisible = false;
  }
}
