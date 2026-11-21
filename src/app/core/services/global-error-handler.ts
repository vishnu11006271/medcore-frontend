import { ErrorHandler, Injectable, inject } from '@angular/core';

import { GlobalErrorService } from './global-error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly globalErrorService = inject(GlobalErrorService);

  handleError(error: unknown): void {
    console.error('Unhandled application error:', error);

    this.globalErrorService.show({
      title: 'Unexpected application error',
      message: 'Something unexpected happened. Please try again. If the problem continues, contact your system administrator.',
      code: 'APP_ERROR'
    });
  }
}
