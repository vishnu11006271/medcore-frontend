import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header">
      <div class="page-header__content">
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
      </div>
      <div class="page-header__actions">
        <ng-content select="[pageHeaderAction]"></ng-content>
      </div>
    </header>
  `,
  host: {
    '[style.margin-bottom]': 'marginBottom'
  },
  styles: [`
    :host {
      display: block;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    h1 {
      margin: 0 0 6px;
      color: #1f2937;
      font-size: 26px;
      font-weight: 700;
    }

    p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
    }

    .page-header__actions {
      flex: 0 0 auto;
    }

    @media (max-width: 768px) {
      .page-header {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() marginBottom = '24px';
}
