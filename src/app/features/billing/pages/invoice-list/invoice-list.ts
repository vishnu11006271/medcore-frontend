import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { BillingService } from '../../services/billing.service';
import { Invoice, InvoiceStatus } from '../../models/billing.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceListComponent implements OnInit {
  private readonly billingService = inject(BillingService);

  readonly invoices = signal<Invoice[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly selectedStatus = signal('');

  readonly filteredInvoices = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.selectedStatus();

    return this.invoices().filter(invoice => {
      const patientName = this.getPatientName(invoice).toLowerCase();

      const matchesSearch =
        !search ||
        invoice.invoiceNumber.toLowerCase().includes(search) ||
        patientName.includes(search);

      const matchesStatus =
        !status || invoice.status === status;

      return matchesSearch && matchesStatus;
    });
  });

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
          error?.error?.message || 'Unable to load invoices.'
        );
        this.loading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onStatusChange(value: string): void {
    this.selectedStatus.set(value);
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
      case 'DRAFT':
        return 'status-draft';
      case 'ISSUED':
        return 'status-issued';
      case 'PARTIALLY_PAID':
        return 'status-partial';
      case 'PAID':
        return 'status-paid';
      case 'VOID':
        return 'status-void';
      default:
        return '';
    }
  }
}