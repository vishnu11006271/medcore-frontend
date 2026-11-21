import { Component, EventEmitter, Input, Output } from '@angular/core';

export type DataStateVariant = 'loading' | 'error' | 'empty';

@Component({
  selector: 'app-data-state',
  standalone: true,
  templateUrl: './data-state.html',
  styleUrl: './data-state.scss',
})
export class DataStateComponent {
  @Input() variant: DataStateVariant = 'empty';
  @Input() title = '';
  @Input() message = '';
  @Input() actionLabel = '';

  @Output() action = new EventEmitter<void>();


  onAction(): void {
    this.action.emit();
  }
}
