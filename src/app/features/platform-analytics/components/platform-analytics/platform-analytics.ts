import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlatformAnalyticsService } from '../../services/platform-analytics.service';
import {
  AppointmentStatus,
  HospitalStatus,
  PlatformAnalytics,
  TopHospital,
  TrendPoint,
} from '../../models/platform-analytics.model';

type DateRange = '7' | '30' | '90' | 'custom';

interface ChartPoint extends TrendPoint {
  label: string;
  height: number;
}

@Component({
  selector: 'app-platform-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './platform-analytics.html',
  styleUrl: './platform-analytics.scss',
})
export class PlatformAnalyticsComponent implements OnInit {
  private readonly analyticsService = inject(PlatformAnalyticsService);

  analytics = signal<PlatformAnalytics | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  selectedRange = signal<DateRange>('30');
  startDate = signal<string>(this.getDefaultStartDate(30));
  endDate = signal<string>(this.getToday());
  readonly maxDate = this.getToday();

  hospitalStatusItems = computed(() => {
    const data = this.analytics()?.hospitals.byStatus;

    if (!data) return [];

    return [
      { label: 'Verified', status: 'VERIFIED', count: data.VERIFIED },
      { label: 'Pending', status: 'PENDING', count: data.PENDING },
      { label: 'Rejected', status: 'REJECTED', count: data.REJECTED },
      { label: 'Suspended', status: 'SUSPENDED', count: data.SUSPENDED },
    ];
  });

  appointmentStatusItems = computed(() => {
    const data = this.analytics()?.appointments.byStatus;

    if (!data) return [];

    return [
      { label: 'Pending', status: 'PENDING', count: data.PENDING },
      { label: 'Scheduled', status: 'SCHEDULED', count: data.SCHEDULED },
      { label: 'Confirmed', status: 'CONFIRMED', count: data.CONFIRMED },
      { label: 'Checked in', status: 'CHECKED_IN', count: data.CHECKED_IN },
      { label: 'In progress', status: 'IN_PROGRESS', count: data.IN_PROGRESS },
      { label: 'Completed', status: 'COMPLETED', count: data.COMPLETED },
      { label: 'Cancelled', status: 'CANCELLED', count: data.CANCELLED },
      { label: 'No show', status: 'NO_SHOW', count: data.NO_SHOW },
    ];
  });

  staffCount = computed(() => {
    const users = this.analytics()?.users;

    if (!users) return 0;

    return (
      users.byRole.DOCTOR +
      users.byRole.NURSE +
      users.byRole.RECEPTIONIST +
      users.byRole.LAB_TECHNICIAN +
      users.byRole.PHARMACIST +
      users.byRole.ACCOUNTANT
    );
  });

  hospitalChart = computed(() =>
    this.createChartPoints(this.analytics()?.trends.hospitals ?? [])
  );

  userChart = computed(() =>
    this.createChartPoints(this.analytics()?.trends.users ?? [])
  );

  appointmentChart = computed(() =>
    this.createChartPoints(this.analytics()?.trends.appointments ?? [])
  );

  ngOnInit(): void {
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.analyticsService
      .getOverview(this.startDate(), this.endDate())
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.analytics.set(response.data);
          } else {
            this.error.set('Unable to load platform analytics.');
          }

          this.loading.set(false);
        },
        error: (err) => {
          console.error('Platform analytics error:', err);

          this.error.set(
            err?.error?.message ||
            'Something went wrong while loading platform analytics.'
          );

          this.loading.set(false);
        },
      });
  }

  selectDateRange(range: DateRange): void {
    this.selectedRange.set(range);

    if (range === 'custom') {
      return;
    }

    const days = Number(range);

    this.startDate.set(this.getDefaultStartDate(days));
    this.endDate.set(this.getToday());

    this.loadAnalytics();
  }

  onStartDateChange(value: string): void {
    this.startDate.set(value);
  }

  onEndDateChange(value: string): void {
    this.endDate.set(value);
  }

  applyCustomDateRange(): void {
    if (!this.startDate() || !this.endDate()) {
      this.error.set('Please select both start and end dates.');
      return;
    }

    if (this.startDate() > this.endDate()) {
      this.error.set('Start date cannot be later than end date.');
      return;
    }

    const start = new Date(`${this.startDate()}T00:00:00`);
    const end = new Date(`${this.endDate()}T00:00:00`);
    const days =
      Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;

    if (days > 366) {
      this.error.set('Please select a date range of 366 days or less.');
      return;
    }

    this.selectedRange.set('custom');
    this.loadAnalytics();
  }

  private createChartPoints(points: TrendPoint[]): ChartPoint[] {
    const maxCount = Math.max(1, ...points.map((point) => point.count));

    return points.map((point) => ({
      ...point,
      label: this.formatChartDate(point.date),
      height: point.count === 0
        ? 0
        : Math.max(5, (point.count / maxCount) * 100),
    }));
  }

  private formatChartDate(date: string): string {
    const parsed = new Date(`${date}T00:00:00`);

    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  }

  private getToday(): string {
    const today = new Date();

    return this.formatInputDate(today);
  }

  private getDefaultStartDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1));

    return this.formatInputDate(date);
  }

  private formatInputDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  hospitalPercentage(count: number): number {
    const total = this.analytics()?.hospitals.total ?? 0;

    return total ? (count / total) * 100 : 0;
  }

  appointmentPercentage(count: number): number {
    const total = this.analytics()?.appointments.total ?? 0;

    return total ? (count / total) * 100 : 0;
  }

  trackHospital(_: number, hospital: TopHospital): string {
    return hospital.id;
  }

  trackHospitalStatus(
    _: number,
    item: { status: HospitalStatus }
  ): HospitalStatus {
    return item.status;
  }

  trackAppointmentStatus(
    _: number,
    item: { status: AppointmentStatus }
  ): AppointmentStatus {
    return item.status;
  }
}