import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AppointmentService } from '../../../../core/services/appointment.service';
import { DoctorAppointment } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-appointments.html',
  styleUrl: './doctor-appointments.scss'
})
export class DoctorAppointments implements OnInit {
  private appointmentService = inject(AppointmentService);

  appointments = signal<DoctorAppointment[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  actionMessage = signal<string>('');
  processingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.appointmentService.getDoctorAppointments().subscribe({
      next: (response) => {
        this.appointments.set(response.data);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.error?.message || 'Unable to load appointments.'
        );
        this.loading.set(false);
      }
    });
  }

  startAppointment(id: string): void {
    this.updateAppointmentStatus(id, 'start');
  }

  completeAppointment(id: string): void {
    this.updateAppointmentStatus(id, 'complete');
  }

  private updateAppointmentStatus(
    id: string,
    action: 'start' | 'complete'
  ): void {
    this.processingId.set(id);
    this.errorMessage.set('');
    this.actionMessage.set('');

    const request = action === 'start'
      ? this.appointmentService.startAppointment(id)
      : this.appointmentService.completeAppointment(id);

    request.subscribe({
      next: () => {
        this.actionMessage.set(
          action === 'start'
            ? 'Appointment started successfully.'
            : 'Appointment completed successfully.'
        );

        this.processingId.set(null);
        this.loadAppointments();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.error?.message || 'Unable to update appointment status.'
        );
        this.processingId.set(null);
      }
    });
  }

  getPatientName(appointment: DoctorAppointment): string {
    return `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;
  }
}