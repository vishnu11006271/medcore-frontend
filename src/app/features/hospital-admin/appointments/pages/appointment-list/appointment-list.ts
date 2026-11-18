import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AppointmentService } from
  '../../../../../core/services/appointment.service';

import {
  HospitalAppointment,
  AppointmentStatus
} from '../../../../../core/models/appointment.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss'
})
export class AppointmentListComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);

  readonly appointments = signal<HospitalAppointment[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly currentPage = signal(1);
  readonly pageSize = 10;
  readonly totalPages = signal(0);
  readonly totalAppointments = signal(0);

  readonly search = signal('');
  readonly selectedStatus = signal('');
  readonly fromDate = signal('');
  readonly toDate = signal('');

  processingId = signal<string | null>(null);
  actionMessage = signal('');

  readonly statuses: AppointmentStatus[] = [
    'PENDING',
    'SCHEDULED',
    'CONFIRMED',
    'CHECKED_IN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
  ];

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.error.set('');

    this.appointmentService.getHospitalAppointments(
      this.currentPage(),
      this.pageSize,
      this.selectedStatus(),
      this.fromDate(),
      this.toDate(),
      this.search()
    ).subscribe({
      next: (response) => {
        this.appointments.set(response.data.appointments);

        const pagination = response.data.pagination;

        this.totalPages.set(pagination.totalPages);
        this.totalAppointments.set(pagination.total);

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err.error?.error?.message ||
          'Unable to load appointments. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadAppointments();
  }

  clearFilters(): void {
    this.search.set('');
    this.selectedStatus.set('');
    this.fromDate.set('');
    this.toDate.set('');
    this.currentPage.set(1);

    this.loadAppointments();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
      this.loadAppointments();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
      this.loadAppointments();
    }
  }

  getPatientName(appointment: HospitalAppointment): string {
    return `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;
  }

  getDoctorName(appointment: HospitalAppointment): string {
    return `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }

  confirmAppointment(id: string): void {
    this.processingId.set(id);
    this.error.set('');
    this.actionMessage.set('');

    this.appointmentService.confirmAppointment(id).subscribe({
      next: (response) => {
        this.actionMessage.set(
          response.message || 'Appointment confirmed successfully.'
        );

        this.processingId.set(null);

        // Reload the current page using existing filters.
        this.loadAppointments();
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(
          error.error?.error?.message ||
          'Unable to confirm appointment.'
        );

        this.processingId.set(null);
      }
    });
  }
}