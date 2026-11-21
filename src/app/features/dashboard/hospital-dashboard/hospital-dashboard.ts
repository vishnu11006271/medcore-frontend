import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { StatCardComponent } from '../../../shared/components/stat-card/stat-card';
import { HospitalDashboardService } from '../../../core/services/hospital-dashboard.service';
import {
  HospitalAppointmentStatus,
  HospitalDashboardOverview,
} from '../../../core/models/hospital-dashboard.model';

@Component({
  selector: 'app-hospital-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './hospital-dashboard.html',
  styleUrl: './hospital-dashboard.scss',
})
export class HospitalDashboardComponent implements OnInit {
  private readonly dashboardService = inject(HospitalDashboardService);
  private readonly destroyRef = inject(DestroyRef);

  readonly overview = signal<HospitalDashboardOverview | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  readonly statCards = computed(() => {
    const statistics = this.overview()?.statistics;

    if (!statistics) {
      return [];
    }

    return [
      {
        title: 'Total Patients',
        value: statistics.totalPatients,
        change: 'Registered patients',
        icon: '♙',
        trend: 'up' as const,
      },
      {
        title: 'Active Doctors',
        value: statistics.totalDoctors,
        change: 'Currently active',
        icon: '⚕',
        trend: 'up' as const,
      },
      {
        title: 'Active Departments',
        value: statistics.totalDepartments,
        change: 'Currently active',
        icon: '▦',
        trend: 'up' as const,
      },
      {
        title: 'Total Appointments',
        value: statistics.totalAppointments,
        change: 'All recorded appointments',
        icon: '◷',
        trend: 'up' as const,
      },
      {
        title: "Today's Appointments",
        value: statistics.todayAppointments,
        change: 'Scheduled for today',
        icon: '✓',
        trend: 'up' as const,
      },
    ];
  });

  readonly appointmentStatuses = computed(() => {
    const counts = this.overview()?.appointments.byStatus;

    if (!counts) {
      return [];
    }

    const statuses: HospitalAppointmentStatus[] = [
      'PENDING',
      'SCHEDULED',
      'CONFIRMED',
      'CHECKED_IN',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ];

    return statuses.map((status) => ({
      status,
      label: status.replace(/_/g, ' '),
      count: counts[status] ?? 0,
    }));
  });

  ngOnInit(): void {
    this.loadOverview();
  }

  loadOverview(): void {
    this.loading.set(true);
    this.error.set('');

    this.dashboardService
      .getOverview()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.overview.set(response.data);
          this.loading.set(false);
        },
        error: (httpError) => {
          this.error.set(
            httpError?.error?.error?.message ??
              httpError?.error?.message ??
              'Unable to load the hospital dashboard. Please try again.'
          );
          this.loading.set(false);
        },
      });
  }

  statusPercentage(count: number): number {
    const total = this.overview()?.statistics.totalAppointments ?? 0;
    return total > 0 ? (count / total) * 100 : 0;
  }
}
