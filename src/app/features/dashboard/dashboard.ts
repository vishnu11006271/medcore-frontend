
import { Component, computed, inject, signal, DestroyRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/auth.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AppointmentService } from '../../core/services/appointment.service';
import { DoctorAppointment } from '../../core/models/appointment.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlatformAnalyticsComponent } from
  '../../features/platform-analytics/components/platform-analytics/platform-analytics';

interface Appointment {
  patient: string;
  doctor: string;
  time: string;
  department: string;
  status: 'Confirmed' | 'Waiting' | 'Completed';
}

interface DashboardConfig {
  title: string;
  description: string;
  modules: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCardComponent, RouterLink, CommonModule, PlatformAnalyticsComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  currentUser = this.authService.user;
  private appointmentService = inject(AppointmentService);

  doctorAppointments = signal<DoctorAppointment[]>([]);
  doctorLoading = signal(false);
  doctorError = signal('');

  selectedFilter = signal<
    'TODAY' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
  >('TODAY');

  ngOnInit(): void {
    if (this.currentUser()?.role === 'DOCTOR') {

      // Initial dashboard load
      this.loadDoctorAppointments();

      // Reload whenever an appointment action succeeds
      this.appointmentService.appointmentUpdated$
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.loadDoctorAppointments();
        });
    }
  }

  dashboardConfig = computed<DashboardConfig>(() => {
    const role = this.currentUser()?.role;

    const configs: Record<UserRole, DashboardConfig> = {
      SUPER_ADMIN: {
        title: 'Platform Overview',
        description: 'Manage hospitals and monitor platform activity.',
        modules: ['Hospitals', 'Users', 'Platform Reports']
      },
      HOSPITAL_ADMIN: {
        title: 'Hospital Overview',
        description: 'Manage hospital operations and monitor activity.',
        modules: ['Departments', 'Doctors', 'Appointments', 'Billing']
      },
      DOCTOR: {
        title: 'Doctor Dashboard',
        description: 'Manage your appointments and patient care.',
        modules: ['Appointments', 'Medical Records', 'Prescriptions']
      },
      NURSE: {
        title: 'Nursing Dashboard',
        description: 'Manage patient care and nursing activities.',
        modules: ['Patients', 'Vitals', 'Medical Records']
      },
      RECEPTIONIST: {
        title: 'Reception Dashboard',
        description: 'Manage patient registration and appointments.',
        modules: ['Patients', 'Appointments']
      },
      LAB_TECHNICIAN: {
        title: 'Laboratory Dashboard',
        description: 'Manage laboratory orders and test results.',
        modules: ['Lab Orders', 'Test Results']
      },
      PHARMACIST: {
        title: 'Pharmacy Dashboard',
        description: 'Manage medicines, stock and prescriptions.',
        modules: ['Medicines', 'Stock', 'Dispensing']
      },
      ACCOUNTANT: {
        title: 'Accounts Dashboard',
        description: 'Manage invoices, payments and billing.',
        modules: ['Invoices', 'Payments', 'Billing Reports']
      },
      PATIENT: {
        title: 'Patient Dashboard',
        description: 'View your appointments and health information.',
        modules: ['Appointments', 'Medical History', 'Prescriptions']
      }
    };

    return role
      ? configs[role]
      : {
          title: 'Dashboard',
          description: 'Welcome to Medcore HMS.',
          modules: []
        };
  });

  readonly stats = [
    {
      title: 'Patients Today',
      value: '128',
      change: '+12.5% from yesterday',
      icon: '♙',
      trend: 'up' as const
    },
    {
      title: 'Total Revenue',
      value: '₹84,250',
      change: '+8.2% from yesterday',
      icon: '₹',
      trend: 'up' as const
    },
    {
      title: 'Occupied Beds',
      value: '86 / 120',
      change: '71.6% occupancy',
      icon: '▣',
      trend: 'up' as const
    },
    {
      title: 'Active Doctors',
      value: '24',
      change: '3 currently unavailable',
      icon: '⚕',
      trend: 'down' as const
    }
  ];

  readonly appointments: Appointment[] = [
    {
      patient: 'Aarav Sharma',
      doctor: 'Dr. Meera',
      time: '09:00 AM',
      department: 'Cardiology',
      status: 'Completed'
    },
    {
      patient: 'Priya Verma',
      doctor: 'Dr. Rahul',
      time: '10:30 AM',
      department: 'Neurology',
      status: 'Confirmed'
    },
    {
      patient: 'Rohan Das',
      doctor: 'Dr. Ananya',
      time: '11:00 AM',
      department: 'Orthopedics',
      status: 'Waiting'
    },
    {
      patient: 'Sneha Patel',
      doctor: 'Dr. Meera',
      time: '12:00 PM',
      department: 'Cardiology',
      status: 'Confirmed'
    }
  ];

  readonly departments = [
    { name: 'Cardiology', occupied: 85 },
    { name: 'Neurology', occupied: 68 },
    { name: 'Orthopedics', occupied: 92 },
    { name: 'Pediatrics', occupied: 55 },
    { name: 'General Medicine', occupied: 74 }
  ];

  readonly lowStockMedicines = [
    { name: 'Paracetamol 500mg', stock: 12 },
    { name: 'Amoxicillin 250mg', stock: 8 },
    { name: 'Cetirizine 10mg', stock: 15 }
  ];

  readonly recentActivities = [
    'New patient registered',
    'Prescription created by Dr. Meera',
    'Lab result approved',
    'Invoice payment received'
  ];

  readonly weeklyAppointments = [
    { day: 'Mon', count: 45, height: 55 },
    { day: 'Tue', count: 62, height: 76 },
    { day: 'Wed', count: 48, height: 59 },
    { day: 'Thu', count: 75, height: 92 },
    { day: 'Fri', count: 58, height: 71 },
    { day: 'Sat', count: 82, height: 100 },
    { day: 'Sun', count: 36, height: 44 }
  ];

  loadDoctorAppointments(): void {
    this.doctorLoading.set(true);
    this.doctorError.set('');

    this.appointmentService.getDoctorAppointments().subscribe({
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
      }
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
          appointment => this.isSameDay(appointment.scheduledAt)
        ).length,
        icon: '▦'
      },
      {
        key: 'UPCOMING' as const,
        title: 'Upcoming Appointments',
        value: appointments.filter(
          appointment => this.isUpcoming(appointment)
        ).length,
        icon: '◷'
      },
      {
        key: 'COMPLETED' as const,
        title: 'Completed Appointments',
        value: appointments.filter(
          appointment => appointment.status === 'COMPLETED'
        ).length,
        icon: '✓'
      },
      {
        key: 'CANCELLED' as const,
        title: 'Cancelled Appointments',
        value: appointments.filter(
          appointment => appointment.status === 'CANCELLED'
        ).length,
        icon: '✕'
      }
    ];
  });

  readonly filteredDoctorAppointments = computed(() => {
    const appointments = this.doctorAppointments();
    const filter = this.selectedFilter();

    let filtered: DoctorAppointment[] = [];

    switch (filter) {
      case 'TODAY':
        filtered = appointments.filter(
          appointment => this.isSameDay(appointment.scheduledAt)
        );
        break;

      case 'UPCOMING':
        filtered = appointments.filter(
          appointment => this.isUpcoming(appointment)
        );
        break;

      case 'COMPLETED':
        filtered = appointments.filter(
          appointment => appointment.status === 'COMPLETED'
        );
        break;

      case 'CANCELLED':
        filtered = appointments.filter(
          appointment => appointment.status === 'CANCELLED'
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

  // Keep your existing stats, appointments,
  // departments, medicines and activities properties here.
}
