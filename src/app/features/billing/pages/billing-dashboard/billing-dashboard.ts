import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { BillingService } from '../../services/billing.service';
import { Invoice, InvoiceStatus } from '../../models/billing.model';

@Component({
  selector: 'app-billing-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './billing-dashboard.html',
  styleUrl: './billing-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingDashboardComponent implements OnInit {

  private readonly billingService = inject(BillingService);

  // Store invoices returned by the backend.
  readonly invoices = signal<Invoice[]>([]);

  // Loading and error states.
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Total number of invoices.
  readonly totalInvoices = computed(() =>
    this.invoices().length
  );

  // Calculate total invoice value.
  readonly totalBilled = computed(() =>
    this.invoices().reduce(
      (total, invoice) => total + Number(invoice.total || 0),
      0
    )
  );

  // Count invoices by status.
  readonly statusCounts = computed(() => {
    const invoices = this.invoices();

    return {
      draft: invoices.filter(invoice => invoice.status === 'DRAFT').length,
      issued: invoices.filter(invoice => invoice.status === 'ISSUED').length,
      partiallyPaid: invoices.filter(
        invoice => invoice.status === 'PARTIALLY_PAID'
      ).length,
      paid: invoices.filter(invoice => invoice.status === 'PAID').length,
      void: invoices.filter(invoice => invoice.status === 'VOID').length
    };
  });

  // Show the five latest invoices.
  readonly recentInvoices = computed(() =>
    this.invoices().slice(0, 5)
  );

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.billingService.getInvoices().subscribe({
      next: response => {
        if (response.success) {
          this.invoices.set(response.data ?? []);
        } else {
          this.errorMessage.set(
            response.message || 'Unable to load invoices.'
          );
        }

        this.loading.set(false);
      },

      error: error => {
        this.errorMessage.set(
          error?.error?.message || 'Unable to load billing information.'
        );

        this.loading.set(false);
      }
    });
  }

  getPatientName(invoice: Invoice): string {
    const user = invoice.patient?.user;

    if (!user) {
      return 'N/A';
    }

    return `${user.firstName} ${user.lastName}`.trim();
  }

  getStatusClass(status: InvoiceStatus): string {
    switch (status) {
      case 'PAID':
        return 'status-paid';

      case 'PARTIALLY_PAID':
        return 'status-partial';

      case 'ISSUED':
        return 'status-issued';

      case 'DRAFT':
        return 'status-draft';

      case 'VOID':
        return 'status-void';

      default:
        return '';
    }
  }
}