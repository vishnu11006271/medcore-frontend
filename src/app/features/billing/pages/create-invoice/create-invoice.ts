import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AppointmentService } from '../../../../core/services/appointment.service';
import { HospitalAppointment } from '../../../../core/models/appointment.model';

import { BillingService } from '../../services/billing.service';
import { CreateInvoiceRequest, Invoice } from '../../models/billing.model';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-invoice.html',
  styleUrl: './create-invoice.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateInvoiceComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly billingService = inject(BillingService);
  private readonly router = inject(Router);

  readonly appointments = signal<HospitalAppointment[]>([]);
  readonly invoices = signal<Invoice[]>([]);

  readonly loadingAppointments = signal(false);
  readonly loadingInvoices = signal(false);
  readonly invoiceCheckFailed = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  appointmentId = '';
  tax = 0;
  discount = 0;

  readonly availableAppointments = computed(() => {
    const invoicedAppointmentIds = new Set(
      this.invoices().map(invoice => invoice.appointmentId)
    );

    return this.appointments().filter(appointment =>
      appointment.status === 'COMPLETED' &&
      !invoicedAppointmentIds.has(appointment.id)
    );
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadingAppointments.set(true);
    this.loadingInvoices.set(true);
    this.invoiceCheckFailed.set(false);
    this.appointmentId = '';
    this.errorMessage.set(null);

    // Load completed hospital appointments.
    this.appointmentService.getHospitalAppointments(
      1,
      100,
      'COMPLETED'
    ).subscribe({
      next: response => {
        if (response.success) {
          this.appointments.set(response.data.appointments ?? []);
        } else {
          this.errorMessage.set(
            response.message || 'Unable to load completed appointments.'
          );
        }

        this.loadingAppointments.set(false);
      },
      error: error => {
        this.errorMessage.set(
          error?.error?.error?.message || error?.error?.message || 'Unable to load appointments.'
        );
        this.loadingAppointments.set(false);
      }
    });

    // Do not allow invoice creation until duplicate-invoice checking succeeds.
    this.billingService.getInvoices().subscribe({
      next: response => {
        if (response.success) {
          this.invoices.set(response.data ?? []);
        } else {
          this.invoiceCheckFailed.set(true);
          this.errorMessage.set(
            response.message || 'Unable to check existing invoices. Please refresh and try again.'
          );
        }
        this.loadingInvoices.set(false);
      },
      error: error => {
        this.invoiceCheckFailed.set(true);
        this.errorMessage.set(
          error?.error?.error?.message ||
          'Unable to check existing invoices. Please refresh and try again.'
        );
        this.loadingInvoices.set(false);
      }
    });
  }

  getAppointmentLabel(appointment: HospitalAppointment): string {
    const patient = appointment.patient.user;
    const doctor = appointment.doctor.user;

    const patientName = `${patient.firstName} ${patient.lastName}`;
    const doctorName = `${doctor.firstName} ${doctor.lastName}`;

    return `${patientName} — Dr. ${doctorName} — ${
      new Date(appointment.scheduledAt).toLocaleString()
    }`;
  }

  createInvoice(): void {
    if (this.loadingAppointments() || this.loadingInvoices() || this.submitting()) {
      return;
    }

    if (!this.appointmentId) {
      this.errorMessage.set('Please select a completed appointment.');
      return;
    }

    if (
      this.invoiceCheckFailed() ||
      !this.availableAppointments().some(item => item.id === this.appointmentId)
    ) {
      this.errorMessage.set(
        'Unable to verify this appointment. Refresh the page and try again.'
      );
      return;
    }

    if (
      !Number.isFinite(Number(this.tax)) ||
      !Number.isFinite(Number(this.discount)) ||
      this.tax < 0 ||
      this.discount < 0
    ) {
      this.errorMessage.set('Tax and discount must be valid non-negative amounts.');
      return;
    }

    const payload: CreateInvoiceRequest = {
      appointmentId: this.appointmentId,
      tax: Number(this.tax),
      discount: Number(this.discount)
    };

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.billingService.createInvoice(payload).subscribe({
      next: response => {
        this.submitting.set(false);

        if (!response.success) {
          this.errorMessage.set(
            response.message || 'Unable to create invoice.'
          );
          return;
        }

        this.router.navigate([
          '/dashboard/billing/invoices',
          response.data.id
        ]);
      },
      error: error => {
        this.submitting.set(false);
        this.errorMessage.set(
          error?.error?.error?.message ||
          error?.error?.message ||
          'Unable to create invoice.'
        );
      }
    });
  }
}