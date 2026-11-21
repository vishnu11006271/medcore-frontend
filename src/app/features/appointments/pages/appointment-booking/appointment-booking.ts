import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Doctor,
  HospitalOption,
  DepartmentOption
} from '../../../../core/models/doctor.model';

import { AvailableSlot } from '../../../../core/models/availability.model';

import { DoctorService } from '../../../../core/services/doctor.service';
import { AvailabilityService } from '../../../../core/services/availability.service';
import { AppointmentService } from '../../../../core/services/appointment.service';

import { CreateAppointmentRequest } from '../../../../core/models/appointment.model';

@Component({
  selector: 'app-appointment-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-booking.html',
  styleUrl: './appointment-booking.scss'
})
export class AppointmentBookingComponent implements OnInit {
  private doctorService = inject(DoctorService);
  private availabilityService = inject(AvailabilityService);
  private appointmentService = inject(AppointmentService);

  hospitals: HospitalOption[] = [];
  departments: DepartmentOption[] = [];
  doctors: Doctor[] = [];
  availableSlots: AvailableSlot[] = [];

  selectedHospitalId = '';
  selectedDepartmentId = '';
  selectedDoctorId = '';
  selectedDate = '';
  selectedSlot: AvailableSlot | null = null;

  reason = '';

  // loadingHospitals = false;
  // loadingDepartments = false;
  // loadingDoctors = false;
  // loadingSlots = false;
  // booking = false;
  readonly loadingHospitals = signal(false);
  readonly loadingDepartments = signal(false);
  readonly loadingDoctors = signal(false);
  readonly loadingSlots = signal(false);
  readonly booking = signal(false);

  errorMessage = '';
  successMessage = '';
  minAppointmentDate = this.getLocalDateString();
  private slotRequestId = 0;

  ngOnInit(): void {
    this.loadHospitals();
  }

  loadHospitals(): void {
    this.loadingHospitals.set(true);
    this.errorMessage = '';

    this.doctorService.getHospitals().subscribe({
      next: response => {
        this.hospitals = (response.data || []).filter(
          hospital => hospital.status === 'VERIFIED'
        );
        this.loadingHospitals.set(false);
      },
      error: error => {
        this.loadingHospitals.set(false);
        this.errorMessage =
          error.error?.error?.message || 'Unable to load hospitals.';
      }
    });
  }

  onHospitalChange(): void {
    this.slotRequestId++;
    this.loadingSlots.set(false);
    this.selectedDepartmentId = '';
    this.selectedDoctorId = '';
    this.selectedDate = '';
    this.departments = [];
    this.doctors = [];
    this.availableSlots = [];
    this.selectedSlot = null;

    if (!this.selectedHospitalId) {
      return;
    }

    this.loadingDepartments.set(true);

    this.doctorService.getDepartments(this.selectedHospitalId).subscribe({
      next: response => {
        this.departments = (response.data || []).filter(
          department => department.isActive
        );
        this.loadingDepartments.set(false);
      },
      error: error => {
        this.loadingDepartments.set(false);
        this.errorMessage =
          error.error?.error?.message || 'Unable to load departments.';
      }
    });
  }

  onDepartmentChange(): void {
    this.slotRequestId++;
    this.loadingSlots.set(false);
    this.selectedDoctorId = '';
    this.selectedDate = '';
    this.doctors = [];
    this.availableSlots = [];
    this.selectedSlot = null;

    if (!this.selectedHospitalId || !this.selectedDepartmentId) {
      return;
    }

    this.loadingDoctors.set(true);

    this.doctorService.getDoctors(this.selectedHospitalId).subscribe({
      next: response => {
        this.doctors = (response.data || []).filter(
          doctor =>
            doctor.departmentId === this.selectedDepartmentId &&
            doctor.user.isActive
        );
        this.loadingDoctors.set(false);
      },
      error: error => {
        this.loadingDoctors.set(false);
        this.errorMessage =
          error.error?.error?.message || 'Unable to load doctors.';
      }
    });
  }

  onDoctorChange(): void {
    this.slotRequestId++;
    this.loadingSlots.set(false);
    this.selectedDate = '';
    this.availableSlots = [];
    this.selectedSlot = null;
  }

  onDateChange(): void {
    this.slotRequestId++;
    this.availableSlots = [];
    this.selectedSlot = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.loadingSlots.set(false);
  }

  private getLocalDateString(): string {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }

  loadAvailableSlots(preserveMessages = false): void {
    if (!preserveMessages) {
      this.errorMessage = '';
      this.successMessage = '';
    }
    this.availableSlots = [];
    this.selectedSlot = null;

    if (!this.selectedDoctorId || !this.selectedDate) {
      this.errorMessage = 'Please select a doctor and appointment date.';
      return;
    }

    if (this.selectedDate < this.minAppointmentDate) {
      this.errorMessage = 'Please select today or a future date.';
      return;
    }

    const requestId = ++this.slotRequestId;
    this.loadingSlots.set(true);

    this.availabilityService
      .getAvailableSlots(this.selectedDoctorId, this.selectedDate)
      .subscribe({
        next: response => {
          if (requestId !== this.slotRequestId) return;
          this.availableSlots = response.data?.slots || [];
          this.loadingSlots.set(false);
        },
        error: error => {
          if (requestId !== this.slotRequestId) return;
          this.loadingSlots.set(false);
          this.errorMessage =
            error.error?.error?.message || 'Unable to load available slots.';
        }
      });
  }

  selectSlot(slot: AvailableSlot): void {
    if (!slot.available) {
      return;
    }

    this.selectedSlot = slot;
    this.errorMessage = '';
  }

  bookAppointment(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.booking()) return;

    if (
      !this.selectedHospitalId ||
      !this.selectedDoctorId ||
      !this.selectedDate ||
      this.selectedDate < this.minAppointmentDate ||
      !this.selectedSlot ||
      !this.availableSlots.includes(this.selectedSlot) ||
      !this.selectedSlot.available
    ) {
      this.errorMessage = 'Please complete all required booking fields.';
      return;
    }

    const localDateTime =`${this.selectedDate}T${this.selectedSlot.startTime}:00`;

    const appointmentDate = new Date(localDateTime);

    if (Number.isNaN(appointmentDate.getTime())) {
      this.errorMessage = 'Invalid appointment date or time. Please select another slot.';
      return;
    }

    const scheduledAt = appointmentDate.toISOString();

    const request: CreateAppointmentRequest = {
      hospitalId: this.selectedHospitalId,
      doctorId: this.selectedDoctorId,
      scheduledAt,
      reason: this.reason.trim() || undefined
    };

    this.booking.set(true);

    this.appointmentService.createAppointment(request).subscribe({
      next: response => {
        this.booking.set(false);
        this.successMessage = 'Appointment booked successfully.';
        this.selectedSlot = null;
        this.reason = '';

        // Refresh availability so the newly booked slot is no longer offered.
        this.loadAvailableSlots(true);
      },
      error: error => {
        this.booking.set(false);
        this.errorMessage =
          error.error?.error?.message || 'Unable to book appointment.';
      }
    });
  }
}