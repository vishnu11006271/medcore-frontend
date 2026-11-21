import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../core/services/auth.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorAppointment } from '../../core/models/appointment.model';
import { PlatformAnalyticsComponent } from
  '../../features/platform-analytics/components/platform-analytics/platform-analytics';
import { HospitalDashboardComponent } from './hospital-dashboard/hospital-dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PlatformAnalyticsComponent,
    HospitalDashboardComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);

  readonly currentUser = this.authService.user;
  readonly doctorAppointments = signal<DoctorAppointment[]>([]);
  readonly doctorLoading = signal(false);
  readonly doctorError = signal('');
  readonly selectedFilter = signal<
    'TODAY' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
  >('TODAY');

  ngOnInit(): void {
    if (this.currentUser()?.role !== 'DOCTOR') {
      return;
    }

    this.loadDoctorAppointments();
    this.appointmentService.appointmentUpdated$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadDoctorAppointments());
  }

  loadDoctorAppointments(): void {
    this.doctorLoading.set(true);
    this.doctorError.set('');

    this.appointmentService
      .getDoctorAppointments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.doctorAppointments.set(response.data ?? []);
          this.doctorLoading.set(false);
        },
        error: (error) => {
          this.doctorError.set(
            error.error?.error?.message ||
              'Unable to load your appointments.'
          );
          this.doctorLoading.set(false);
        },
      });
  }

  private isSameDay(dateValue: string): boolean {
    const date = new Date(dateValue);
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  private isUpcoming(appointment: DoctorAppointment): boolean {
    const scheduledDate = new Date(appointment.scheduledAt);

    return (
      scheduledDate.getTime() > Date.now() &&
      ['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(appointment.status)
    );
  }

  readonly doctorStats = computed(() => {
    const appointments = this.doctorAppointments();

    return [
      {
        key: 'TODAY' as const,
        title: "Today's Appointments",
        value: appointments.filter(
          (appointment) => this.isSameDay(appointment.scheduledAt)
        ).length,
        icon: '▦',
      },
      {
        key: 'UPCOMING' as const,
        title: 'Upcoming Appointments',
        value: appointments.filter((appointment) =>
          this.isUpcoming(appointment)
        ).length,
        icon: '◷',
      },
      {
        key: 'COMPLETED' as const,
        title: 'Completed Appointments',
        value: appointments.filter(
          (appointment) => appointment.status === 'COMPLETED'
        ).length,
        icon: '✓',
      },
      {
        key: 'CANCELLED' as const,
        title: 'Cancelled Appointments',
        value: appointments.filter(
          (appointment) => appointment.status === 'CANCELLED'
        ).length,
        icon: '✕',
      },
    ];
  });

  readonly filteredDoctorAppointments = computed(() => {
    const appointments = this.doctorAppointments();
    const filter = this.selectedFilter();

    let filtered: DoctorAppointment[] = [];

    switch (filter) {
      case 'TODAY':
        filtered = appointments.filter((appointment) =>
          this.isSameDay(appointment.scheduledAt)
        );
        break;
      case 'UPCOMING':
        filtered = appointments.filter((appointment) =>
          this.isUpcoming(appointment)
        );
        break;
      case 'COMPLETED':
        filtered = appointments.filter(
          (appointment) => appointment.status === 'COMPLETED'
        );
        break;
      case 'CANCELLED':
        filtered = appointments.filter(
          (appointment) => appointment.status === 'CANCELLED'
        );
        break;
    }

    return [...filtered].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() -
        new Date(b.scheduledAt).getTime()
    );
  });

  setAppointmentFilter(
    filter: 'TODAY' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
  ): void {
    this.selectedFilter.set(filter);
  }

  getDoctorPatientName(appointment: DoctorAppointment): string {
    return `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;
  }
}
