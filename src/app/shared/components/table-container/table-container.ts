import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-container',
  standalone: true,
  template: `
    <div
      class="table-container"
      [class.table-container--bordered]="variant === 'bordered'"
      role="region"
      [attr.aria-label]="ariaLabel"
      tabindex="0">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 100%;
    }

    .table-container {
      max-width: 100%;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: #94a3b8 #f1f5f9;
    }

    .table-container:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 3px;
    }

    .table-container::-webkit-scrollbar {
      height: 8px;
    }

    .table-container::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 8px;
    }

    .table-container::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 8px;
    }

    .table-container--bordered {
      overflow: auto;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
    }
  `]
})
export class TableContainerComponent {
  @Input() ariaLabel = 'Data table. Scroll horizontally to view all columns.';
  @Input() variant: 'plain' | 'bordered' = 'plain';
}
