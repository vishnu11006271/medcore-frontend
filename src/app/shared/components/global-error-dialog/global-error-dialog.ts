import { Component, inject } from '@angular/core';

import { GlobalErrorService } from '../../../core/services/global-error.service';

@Component({
  selector: 'app-global-error-dialog',
  standalone: true,
  templateUrl: './global-error-dialog.html',
  styleUrl: './global-error-dialog.scss'
})
export class GlobalErrorDialogComponent {
  readonly errorService = inject(GlobalErrorService);

  dismiss(): void {
    this.errorService.dismiss();
  }
}
