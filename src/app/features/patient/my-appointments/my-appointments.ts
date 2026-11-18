import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentService } from '../../../core/services/appointment.service';
import { MyAppointment } from '../../../core/models/appointment.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-appointments.html',
  styleUrl: './my-appointments.scss'
})
export class MyAppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  appointments: MyAppointment[] = [];

  readonly isLoading = signal(false);
  errorMessage = '';

  selectedTab: 'upcoming' | 'past' = 'upcoming';

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.errorMessage = '';

    this.appointmentService.getMyAppointments().subscribe({
      next: (response) => {
        if (response.success) {
          this.appointments = response.data || [];
        } else {
          this.errorMessage = response.message || 'Unable to load appointments.';
        }

        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.error?.message ||
          'Something went wrong while loading appointments.';

        this.isLoading.set(false);
      }
    });
  }

  get upcomingAppointments(): MyAppointment[] {
    const now = new Date();

    const activeStatuses = [
      'PENDING',
      'SCHEDULED',
      'CONFIRMED',
      'CHECKED_IN',
      'IN_PROGRESS'
    ];

    return this.appointments
      .filter(appointment =>
        new Date(appointment.scheduledAt) >= now &&
        activeStatuses.includes(appointment.status)
      )
      .sort((a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
      );
  }

  get pastAppointments(): MyAppointment[] {
    const now = new Date();

    const activeStatuses = [
      'PENDING',
      'SCHEDULED',
      'CONFIRMED',
      'CHECKED_IN',
      'IN_PROGRESS'
    ];

    return this.appointments
      .filter(appointment =>
        new Date(appointment.scheduledAt) < now ||
        !activeStatuses.includes(appointment.status)
      )
      .sort((a, b) =>
        new Date(b.scheduledAt).getTime() -
        new Date(a.scheduledAt).getTime()
      );
  }

  get displayedAppointments(): MyAppointment[] {
    return this.selectedTab === 'upcoming'
      ? this.upcomingAppointments
      : this.pastAppointments;
  }

  selectTab(tab: 'upcoming' | 'past'): void {
    this.selectedTab = tab;
  }

  getDoctorName(appointment: MyAppointment): string {
    const doctor = appointment.doctor.user;

    return `Dr. ${doctor.firstName} ${doctor.lastName}`;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/_/g, '-');
  }

  retry(): void {
    this.loadAppointments();
  }
}