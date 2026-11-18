import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AppointmentService } from
  '../../../../../core/services/appointment.service';

import { HospitalAppointmentDetails } from
  '../../../../../core/models/appointment.model';

@Component({
  selector: 'app-hospital-appointment-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './appointment-details.html',
  styleUrl: './appointment-details.scss'
})
export class HospitalAppointmentDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly appointmentService = inject(AppointmentService);

  readonly appointment = signal<HospitalAppointmentDetails | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('id');

    if (!appointmentId) {
      this.error.set('Appointment ID is missing.');
      this.loading.set(false);
      return;
    }

    this.loadAppointment(appointmentId);
  }

  loadAppointment(id: string): void {
    this.loading.set(true);
    this.error.set('');

    this.appointmentService.getHospitalAppointmentById(id).subscribe({
      next: (response) => {
        this.appointment.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err.error?.error?.message ||
          'Unable to load appointment details. Please try again.'
        );

        this.loading.set(false);
      }
    });
  }

  getPatientName(): string {
    const patient = this.appointment()?.patient;

    return patient
      ? `${patient.user.firstName} ${patient.user.lastName}`
      : '—';
  }

  getDoctorName(): string {
    const doctor = this.appointment()?.doctor;

    return doctor
      ? `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`
      : '—';
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }
}