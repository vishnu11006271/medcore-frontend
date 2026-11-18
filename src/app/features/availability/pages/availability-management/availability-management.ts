
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DoctorService } from '../../../../core/services/doctor.service';
import { AvailabilityService } from '../../../../core/services/availability.service';
import { AuthService } from '../../../../core/services/auth.service';

import {
  Doctor,
  HospitalOption
} from '../../../../core/models/doctor.model';

import {
  AvailabilityInterval,
  AvailableSlot
} from '../../../../core/models/availability.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-availability-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './availability-management.html',
  styleUrl: './availability-management.scss'
})
export class AvailabilityManagementComponent implements OnInit {
  constructor() {
  console.log('AvailabilityManagementComponent created');
}

  private doctorService = inject(DoctorService);
  private availabilityService = inject(AvailabilityService);
  private authService = inject(AuthService);

  hospitals: HospitalOption[] = [];
  doctors: Doctor[] = [];
  schedule: AvailabilityInterval[] = [];

  selectedHospitalId = '';
  selectedDoctorId = '';

  readonly loadingHospitals = signal(false);
  readonly loadingDoctors = signal(false);
  readonly loadingSchedule = signal(false);
  saving = false;

  errorMessage = '';
  successMessage = '';

  selectedDate = '';
  availableSlots: AvailableSlot[] = [];

  readonly loadingSlots = signal(false);
  readonly slotsChecked = signal(false);

  days = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  // Form visibility
  showIntervalForm = false;
  isEditMode = false;

  // Selected day and interval
  selectedDay = 1;
  editingIndex: number | null = null;

  // Form fields
  startTime = '09:00';
  endTime = '17:00';
  slotDurationMinutes = 30;

  ngOnInit(): void {
    const user = this.authService.user();

    if (!user) {
      this.errorMessage = 'Unable to identify the logged-in user.';
      return;
    }

    if (user.role === 'SUPER_ADMIN') {
      // Super Admin can select any hospital.
      this.loadHospitals();
      return;
    }

    if (user.role === 'HOSPITAL_ADMIN') {
      // Automatically use the hospital assigned to this admin.
      if (!user.hospitalId) {
        this.errorMessage = 'No hospital is assigned to your account.';
        return;
      }

      this.selectedHospitalId = user.hospitalId;
      this.onHospitalChange();
      return;
    }

    this.errorMessage = 'You are not authorized to manage availability.';
  }

  // loadHospitals(): void {
  //   this.loadingHospitals = true;
  //   this.errorMessage = '';

  //   this.doctorService.getHospitals().subscribe({
  //     next: (response) => {
  //       this.hospitals = response.data;
  //       this.loadingHospitals = false;
  //       console.log(this.loadingHospitals);
  //     },
  //     error: (error) => {
  //       this.loadingHospitals = false;
  //       this.errorMessage =
  //         error.error?.error?.message || 'Unable to load hospitals.';
  //     }
  //   });
  // }
  loadHospitals(): void {
  this.loadingHospitals.set(true);
  this.errorMessage = '';

  this.doctorService.getHospitals()
    .pipe(
      finalize(() => {
        this.loadingHospitals.set(false);
        console.log('Hospital loading:', this.loadingHospitals);
      })
    )
    .subscribe({
      next: (response) => {
        this.hospitals = response.data || [];
        console.log('Hospitals:', this.hospitals);
      },
      error: (error) => {
        console.error('Hospital API error:', error);

        this.errorMessage =
          error.error?.error?.message || 'Unable to load hospitals.';
      }
    });
}

  // onHospitalChange(): void {
  //   this.selectedDoctorId = '';
  //   this.doctors = [];
  //   this.schedule = [];

  //   if (!this.selectedHospitalId) {
  //     return;
  //   }

  //   this.loadingDoctors = true;
  //   this.errorMessage = '';

  //   this.doctorService.getDoctors(this.selectedHospitalId).subscribe({
  //     next: (response) => {
  //       this.doctors = response.data;
  //       this.loadingDoctors = false;
  //     },
  //     error: (error) => {
  //       this.loadingDoctors = false;
  //       this.errorMessage =
  //         error.error?.error?.message || 'Unable to load doctors.';
  //     }
  //   });
  // }
  onHospitalChange(): void {
    const user = this.authService.user();

    // Hospital Admin must always use their assigned hospital.
    if (user?.role === 'HOSPITAL_ADMIN') {
      this.selectedHospitalId = user.hospitalId || '';
    }

    this.selectedDoctorId = '';
    this.doctors = [];
    this.schedule = [];
    this.availableSlots = [];

    this.slotsChecked.set(false);
    this.loadingDoctors.set(false);

    if (!this.selectedHospitalId) {
      return;
    }

    this.loadingDoctors.set(true);
    this.errorMessage = '';

    this.doctorService.getDoctors(this.selectedHospitalId)
      .pipe(
        finalize(() => {
          this.loadingDoctors.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.doctors = response.data || [];
        },
        error: (error) => {
          this.errorMessage =
            error.error?.error?.message || 'Unable to load doctors.';
        }
      });
  }

  onDoctorChange(): void {
    this.selectedDate = '';
    this.availableSlots = [];
    this.slotsChecked.set(false);
    this.loadingSlots.set(false);
    this.schedule = [];

    if (!this.selectedDoctorId) {
      return;
    }

    this.loadWeeklySchedule();
  }

  loadWeeklySchedule(): void {
    this.loadingSchedule.set(true);
    this.errorMessage = '';

    this.availabilityService
      .getWeeklySchedule(this.selectedDoctorId)
      .subscribe({
        next: (response) => {
          this.schedule = response.data || [];
          this.loadingSchedule.set(false);
        },
        error: (error) => {
          this.loadingSchedule.set(false);
          this.errorMessage =
            error.error?.error?.message ||
            'Unable to load weekly availability.';
        }
      });
  }

  
  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${remainingMinutes
      .toString()
      .padStart(2, '0')} ${period}`;
  }

  openAddForm(dayOfWeek: number): void {
    this.selectedDay = dayOfWeek;
    this.isEditMode = false;
    this.editingIndex = null;

    this.startTime = '09:00';
    this.endTime = '17:00';
    this.slotDurationMinutes = 30;

    this.showIntervalForm = true;
  }

  openEditForm(interval: AvailabilityInterval, index: number): void {
    this.selectedDay = interval.dayOfWeek;
    this.isEditMode = true;
    this.editingIndex = index;

    this.startTime = this.toTimeInput(interval.startMinute);
    this.endTime = this.toTimeInput(interval.endMinute);
    this.slotDurationMinutes = interval.slotDurationMinutes;

    this.showIntervalForm = true;
  }

  closeIntervalForm(): void {
    this.showIntervalForm = false;
    this.editingIndex = null;
  }

  private toTimeInput(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  
  getIntervalsForDay(dayOfWeek: number): AvailabilityInterval[] {
    return this.schedule.filter(
      interval => interval.dayOfWeek === dayOfWeek
    );
  }

  getIntervalIndex(interval: AvailabilityInterval): number {
    return this.schedule.indexOf(interval);
  }

  
  /**
   * Save an interval locally.
   * The backend is updated only when Save Schedule is clicked.
   */
  saveInterval(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.startTime || !this.endTime) {
      this.errorMessage = 'Please select start time and end time.';
      return;
    }

    const startMinute = this.toMinutes(this.startTime);
    const endMinute = this.toMinutes(this.endTime);
    const duration = Number(this.slotDurationMinutes);

    if (startMinute >= endMinute) {
      this.errorMessage = 'End time must be later than start time.';
      return;
    }

    if (!Number.isInteger(duration) || duration < 5 || duration > 240) {
      this.errorMessage = 'Slot duration must be between 5 and 240 minutes.';
      return;
    }

    if ((endMinute - startMinute) % duration !== 0) {
      this.errorMessage =
        'Working hours must be divisible by the slot duration.';
      return;
    }

    const hasOverlap = this.schedule.some((interval, index) => {
      if (this.isEditMode && index === this.editingIndex) {
        return false;
      }

      if (interval.dayOfWeek !== this.selectedDay) {
        return false;
      }

      return (
        startMinute < interval.endMinute &&
        endMinute > interval.startMinute
      );
    });

    if (hasOverlap) {
      this.errorMessage =
        'This working-hour interval overlaps with an existing interval.';
      return;
    }

    const newInterval: AvailabilityInterval = {
      dayOfWeek: this.selectedDay,
      startMinute,
      endMinute,
      slotDurationMinutes: duration,
      isActive: true
    };

    if (this.isEditMode && this.editingIndex !== null) {
      this.schedule[this.editingIndex] = newInterval;
    } else {
      this.schedule.push(newInterval);
    }

    this.schedule = [...this.schedule].sort(
      (a, b) =>
        a.dayOfWeek - b.dayOfWeek ||
        a.startMinute - b.startMinute
    );

    this.closeIntervalForm();
  }

  /**
   * Remove an interval locally.
   */
  removeInterval(index: number): void {
    const confirmed = window.confirm(
      'Are you sure you want to remove this working-hour interval?'
    );

    if (!confirmed) {
      return;
    }

    this.schedule = this.schedule.filter(
      (_, currentIndex) => currentIndex !== index
    );

    this.successMessage = 'Interval removed. Save the schedule to apply changes.';
    this.errorMessage = '';
  }

  /**
   * Persist the complete weekly schedule.
   */
  saveWeeklySchedule(): void {
    if (!this.selectedDoctorId) {
      this.errorMessage = 'Please select a doctor.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      schedule: this.schedule.map(interval => ({
        dayOfWeek: interval.dayOfWeek,
        startMinute: interval.startMinute,
        endMinute: interval.endMinute,
        slotDurationMinutes: interval.slotDurationMinutes,
        isActive: interval.isActive ?? true
      }))
    };

    this.availabilityService
      .setWeeklySchedule(this.selectedDoctorId, request)
      .subscribe({
        next: (response) => {
          this.schedule = response.data || [];
          this.saving = false;
          this.successMessage = 'Weekly availability saved successfully.';
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage =
            error.error?.error?.message ||
            'Unable to save weekly availability.';
        }
      });
  }

  loadAvailableSlots(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.availableSlots = [];
    this.slotsChecked.set(false);

    if (!this.selectedDoctorId) {
      this.errorMessage = 'Please select a doctor.';
      return;
    }

    if (!this.selectedDate) {
      this.errorMessage = 'Please select a date.';
      return;
    }

    this.loadingSlots.set(true);

    this.availabilityService
      .getAvailableSlots(this.selectedDoctorId, this.selectedDate)
      .pipe(
        finalize(() => {
          this.loadingSlots.set(false);
        })
      )
      .subscribe({
        next: response => {
          this.availableSlots = response.data?.slots || [];
          this.slotsChecked.set(true);
        },
        error: error => {
          this.errorMessage =
            error.error?.error?.message ||
            'Unable to load available appointment slots.';
        }
      });
  }

  isSuperAdmin(): boolean {
    return this.authService.user()?.role === 'SUPER_ADMIN';
  }



}
