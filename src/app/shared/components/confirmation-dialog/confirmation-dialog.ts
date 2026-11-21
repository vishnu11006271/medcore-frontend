import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

export type ConfirmationVariant = 'primary' | 'danger' | 'success';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss'
})
export class ConfirmationDialogComponent {
  @Input() title = 'Confirm action';
  @Input() message = 'Are you sure you want to continue?';
  @Input() description = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmVariant: ConfirmationVariant = 'primary';
  @Input() busy = false;
  @Input() busyText = 'Processing...';
  @Input() errorMessage: string | null = null;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm(): void {
    if (!this.busy) this.confirmed.emit();
  }

  cancel(): void {
    if (!this.busy) this.cancelled.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancel();
  }
}
