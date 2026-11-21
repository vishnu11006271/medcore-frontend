import { Injectable, computed, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface GlobalErrorDialogState {
  title: string;
  message: string;
  code?: string;
}

interface ApiErrorBody {
  message?: unknown;
  error?: {
    message?: unknown;
    code?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorService {
  private readonly queue = signal<GlobalErrorDialogState[]>([]);

  readonly currentError = computed(() => this.queue()[0] ?? null);

  show(error: GlobalErrorDialogState): void {
    const normalizedMessage = error.message.trim();

    if (!normalizedMessage) {
      return;
    }

    const alreadyQueued = this.queue().some(
      item => item.code === error.code && item.message === normalizedMessage
    );

    if (alreadyQueued) {
      return;
    }

    this.queue.update(items => [
      ...items,
      { ...error, message: normalizedMessage }
    ]);
  }

  showHttpError(error: HttpErrorResponse): void {
    const body = error.error as ApiErrorBody | string | null;
    const apiError = typeof body === 'object' && body !== null
      ? body.error
      : undefined;

    const serverMessage = this.toMessage(
      apiError?.message ??
      (typeof body === 'object' && body !== null ? body.message : body)
    );

    let message = serverMessage;

    if (error.status === 0) {
      message = 'Unable to connect to the server. Check your internet connection and try again.';
    } else if (error.status === 401) {
      message = 'Your session is no longer valid. Please sign in again.';
    } else if (error.status === 403) {
      message = serverMessage || 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      message = serverMessage || 'The requested information could not be found.';
    } else if (error.status === 409) {
      message = serverMessage || 'This action conflicts with the current data. Refresh and try again.';
    } else if (error.status === 422) {
      message = serverMessage || 'Some of the submitted information is not valid.';
    } else if (error.status === 429) {
      message = serverMessage || 'Too many requests. Please wait a moment and try again.';
    } else if (error.status >= 500) {
      message = 'The server could not complete your request. Please try again later.';
    } else {
      message = serverMessage || 'The request could not be completed. Please try again.';
    }

    this.show({
      title: error.status >= 500 ? 'Server error' : 'Request failed',
      message,
      code: apiError?.code || (error.status ? `HTTP ${error.status}` : 'NETWORK_ERROR')
    });
  }

  dismiss(): void {
    this.queue.update(items => items.slice(1));
  }

  private toMessage(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (Array.isArray(value)) {
      return value
        .map(item => {
          if (typeof item === 'string') {
            return item;
          }

          if (item && typeof item === 'object' && 'message' in item) {
            return String((item as { message: unknown }).message);
          }

          return '';
        })
        .filter(Boolean)
        .join('\n');
    }

    return '';
  }
}
