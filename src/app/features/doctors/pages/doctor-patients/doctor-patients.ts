import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { AppointmentService } from '../../../../core/services/appointment.service';
import { DoctorPatient } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-doctor-patients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-patients.html',
  styleUrl: './doctor-patients.scss'
})
export class DoctorPatients implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly router = inject(Router);

  readonly patients = signal<DoctorPatient[]>([]);
  readonly searchTerm = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly filteredPatients = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.patients();
    }

    return this.patients().filter((patient) => {
      const fullName =
        `${patient.user.firstName} ${patient.user.lastName}`.toLowerCase();

      return (
        fullName.includes(term) ||
        patient.user.email.toLowerCase().includes(term) ||
        (patient.patientNumber ?? '').toLowerCase().includes(term) ||
        (patient.user.phone ?? '').toLowerCase().includes(term)
      );
    });
  });

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.appointmentService.getDoctorPatients().subscribe({
      next: (response) => {
        this.patients.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.error?.message || 'Unable to load your patients.'
        );
        this.loading.set(false);
      }
    });
  }

  openPatientDetails(patientId: string): void {
    this.router.navigate(['/dashboard/doctor-patients', patientId]);
  }

  getPatientName(patient: DoctorPatient): string {
    return `${patient.user.firstName} ${patient.user.lastName}`;
  }

  getInitials(patient: DoctorPatient): string {
    return `${patient.user.firstName.charAt(0)}${patient.user.lastName.charAt(0)}`
      .toUpperCase();
  }
}
