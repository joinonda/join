import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  show(message: string, duration: number = 2000): void {
    this.message = message;
    this.isVisible = false;

    setTimeout(() => {
      this.isVisible = true;
    }, 10);

    setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    this.isVisible = false;
  }
}
