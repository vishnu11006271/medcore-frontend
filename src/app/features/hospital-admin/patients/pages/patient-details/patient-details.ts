import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PatientService } from '../../../../../core/services/patient.service';

import {
  Patient,
  PatientAppointment,
  PatientMedicalRecord
} from '../../../../../core/models/patient.model';

type PatientTab = 'profile' | 'appointments' | 'records';

@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-details.html',
  styleUrl: './patient-details.scss'
})
export class PatientDetailsComponent implements OnInit {

  private readonly patientService = inject(PatientService);
  private readonly route = inject(ActivatedRoute);

  // Patient profile
  patient = signal<Patient | null>(null);

  // Appointments
  appointments = signal<PatientAppointment[]>([]);
  appointmentTotal = signal<number>(0);
  appointmentPage = signal<number>(1);
  appointmentTotalPages = signal<number>(0);

  // Medical records
  medicalRecords = signal<PatientMedicalRecord[]>([]);
  recordTotal = signal<number>(0);
  recordPage = signal<number>(1);
  recordTotalPages = signal<number>(0);

  // UI state
  activeTab = signal<PatientTab>('profile');

  loadingProfile = signal<boolean>(false);
  loadingAppointments = signal<boolean>(false);
  loadingRecords = signal<boolean>(false);

  errorMessage = signal<string>('');
  appointmentError = signal<string>('');
  recordError = signal<string>('');

  private readonly pageSize = 10;
  private patientId = '';

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.patientId) {
      this.errorMessage.set('Patient ID is missing.');
      return;
    }

    this.loadPatient();
  }

  // Load patient profile
  loadPatient(): void {
    this.loadingProfile.set(true);
    this.errorMessage.set('');

    this.patientService.getPatientById(this.patientId).subscribe({
      next: (response) => {
        this.patient.set(response.data);
        this.loadingProfile.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.error?.error?.message ||
          'Unable to load patient details.'
        );
        this.loadingProfile.set(false);
      }
    });
  }

  // Change active tab
  selectTab(tab: PatientTab): void {
    this.activeTab.set(tab);

    if (tab === 'appointments' && this.appointments().length === 0) {
      this.loadAppointments();
    }

    if (tab === 'records' && this.medicalRecords().length === 0) {
      this.loadMedicalRecords();
    }
  }

  // Load patient appointments
  loadAppointments(): void {
    this.loadingAppointments.set(true);
    this.appointmentError.set('');

    this.patientService.getPatientAppointments(
      this.patientId,
      this.appointmentPage(),
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.appointments.set(response.data.appointments);

        this.appointmentTotal.set(
          response.data.pagination.total
        );

        this.appointmentTotalPages.set(
          response.data.pagination.totalPages
        );

        this.loadingAppointments.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.appointmentError.set(
          error.error?.error?.message ||
          'Unable to load patient appointments.'
        );
        this.loadingAppointments.set(false);
      }
    });
  }

  // Load patient medical records
  loadMedicalRecords(): void {
    this.loadingRecords.set(true);
    this.recordError.set('');

    this.patientService.getPatientMedicalRecords(
      this.patientId,
      this.recordPage(),
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.medicalRecords.set(response.data.records);

        this.recordTotal.set(
          response.data.pagination.total
        );

        this.recordTotalPages.set(
          response.data.pagination.totalPages
        );

        this.loadingRecords.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.recordError.set(
          error.error?.error?.message ||
          'Unable to load patient medical records.'
        );
        this.loadingRecords.set(false);
      }
    });
  }

  // Appointment pagination
  previousAppointmentPage(): void {
    if (this.appointmentPage() > 1) {
      this.appointmentPage.update(page => page - 1);
      this.loadAppointments();
    }
  }

  nextAppointmentPage(): void {
    if (this.appointmentPage() < this.appointmentTotalPages()) {
      this.appointmentPage.update(page => page + 1);
      this.loadAppointments();
    }
  }

  // Medical record pagination
  previousRecordPage(): void {
    if (this.recordPage() > 1) {
      this.recordPage.update(page => page - 1);
      this.loadMedicalRecords();
    }
  }

  nextRecordPage(): void {
    if (this.recordPage() < this.recordTotalPages()) {
      this.recordPage.update(page => page + 1);
      this.loadMedicalRecords();
    }
  }

  getPatientName(): string {
    const user = this.patient()?.user;

    return user
      ? `${user.firstName} ${user.lastName}`
      : '';
  }

  getPatientInitials(): string {
    const user = this.patient()?.user;

    if (!user) {
      return 'P';
    }

    return (
      user.firstName.charAt(0) +
      user.lastName.charAt(0)
    ).toUpperCase();
  }

  getDoctorName(appointment: PatientAppointment): string {
    return `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
  }

  getRecordDoctorName(record: PatientMedicalRecord): string {
    return `${record.doctor.user.firstName} ${record.doctor.user.lastName}`;
  }
}