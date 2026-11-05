
import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/auth.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';

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
  imports: [StatCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  private authService = inject(AuthService);

  currentUser = this.authService.user;

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

  // Keep your existing stats, appointments,
  // departments, medicines and activities properties here.
}
