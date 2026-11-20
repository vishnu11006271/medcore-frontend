import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  DoctorPatientDetails as DoctorPatientDetailsModel
} from '../../../../core/models/appointment.model';
import { AppointmentService } from '../../../../core/services/appointment.service';

@Component({
  selector: 'app-doctor-patient-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-patient-details.html',
  styleUrl: './doctor-patient-details.scss'
})
export class DoctorPatientDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appointmentService = inject(AppointmentService);

  readonly patient = signal<DoctorPatientDetailsModel | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const patientId = this.route.snapshot.paramMap.get('id');

    if (!patientId) {
      this.errorMessage.set('Patient identifier is missing.');
      return;
    }

    this.loadPatient(patientId);
  }

  loadPatient(patientId: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.appointmentService.getDoctorPatientDetails(patientId).subscribe({
      next: (response) => {
        this.patient.set(response.data);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.error?.message || 'Unable to load patient details.'
        );
        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/doctor-patients']);
  }

  get patientName(): string {
    const patient = this.patient();

    return patient
      ? `${patient.user.firstName} ${patient.user.lastName}`
      : '';
  }
}
