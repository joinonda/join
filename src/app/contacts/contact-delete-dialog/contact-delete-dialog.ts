import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-contact-delete-dialog',
  standalone: true,
  templateUrl: './contact-delete-dialog.html',
  styleUrls: ['./contact-delete-dialog.scss']
})
export class ContactDeleteDialogComponent {
  @Output() delete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onDelete(): void {
    this.delete.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
