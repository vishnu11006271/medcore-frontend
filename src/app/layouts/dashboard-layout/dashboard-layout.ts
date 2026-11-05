import { Component, computed, inject } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { UserRole } from '../../core/models/auth.model';

interface NavigationItem {
  label: string;
  icon: string;
  route: string | null;
  enabled: boolean;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss'
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  doctorsExpanded = false;

  sidebarOpen = false;

  // Read the authenticated user from AuthService.
  readonly currentUser = this.authService.user;

  readonly currentRole = computed(
    () => this.currentUser()?.role ?? null
  );

  readonly displayName = computed(() => {
    const user = this.currentUser();

    return user
      ? `${user.firstName} ${user.lastName}`
      : 'User';
  });

  readonly userInitials = computed(() => {
    const user = this.currentUser();

    if (!user) {
      return 'U';
    }

    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      .toUpperCase();
  });

  // Only Dashboard is enabled for now.
  // Other pages will be enabled as their modules are implemented.
  private readonly navigationByRole: Record<UserRole, NavigationItem[]> = {
    SUPER_ADMIN: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      { label: 'Hospitals', icon: '✚', route: '/dashboard/hospitals', enabled: true },
      { label: 'Departments', icon: '▤', route: '/dashboard/departments', enabled: true },
      { label: 'Hospital Verification', icon: '✓', route: null, enabled: false },
      { label: 'Platform Users', icon: '♙', route: null, enabled: false },
      {
        label: 'Doctors',
        icon: '⚕',
        route: null,
        enabled: true,
        children: [
          {
            label: 'Doctor List',
            icon: '♙',
            route: '/dashboard/doctors',
            enabled: true
          },
          {
            label: 'Availability',
            icon: '◷',
            route: '/dashboard/availability',
            enabled: true
          }
        ]
      },
      { label: 'Analytics', icon: '▥', route: null, enabled: false }
    ],

    HOSPITAL_ADMIN: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      { label: 'Appointments', icon: '▣', route: null, enabled: false },
      { label: 'Patients', icon: '♙', route: null, enabled: false },
      {
        label: 'Doctors',
        icon: '⚕',
        route: null,
        enabled: true,
        children: [
          {
            label: 'Doctor List',
            icon: '♙',
            route: '/dashboard/doctors',
            enabled: true
          },
          {
            label: 'Availability',
            icon: '◷',
            route: '/dashboard/availability',
            enabled: true
          }
        ]
      },
      { label: 'Departments', icon: '▤', route: '/dashboard/departments', enabled: true },
      { label: 'Laboratory', icon: '⚗', route: null, enabled: false },
      { label: 'Pharmacy', icon: '✚', route: null, enabled: false },
      { label: 'Billing', icon: '₹', route: null, enabled: false },
      { label: 'Reports', icon: '▥', route: null, enabled: false }
    ],

    DOCTOR: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      { label: 'Appointments', icon: '▣', route: null, enabled: false },
      { label: 'My Patients', icon: '♙', route: null, enabled: false },
      { label: 'Medical Records', icon: '▤', route: null, enabled: false },
      { label: 'Prescriptions', icon: '✚', route: null, enabled: false },
      { label: 'Lab Results', icon: '⚗', route: null, enabled: false }
    ],

    NURSE: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      { label: 'Assigned Patients', icon: '♙', route: null, enabled: false },
      { label: 'Vitals', icon: '♡', route: null, enabled: false },
      { label: 'Medication Tasks', icon: '✚', route: null, enabled: false },
      { label: 'Nursing Tasks', icon: '▤', route: null, enabled: false }
    ],

    RECEPTIONIST: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      { label: 'Patient Registration', icon: '♙', route: null, enabled: false },
      { label: 'Appointments', icon: '▣', route: null, enabled: false },
      { label: 'Check-in Queue', icon: '▤', route: null, enabled: false },
      { label: 'Payments', icon: '₹', route: null, enabled: false }
    ],

    LAB_TECHNICIAN: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      { label: 'Lab Orders', icon: '⚗', route: null, enabled: false },
      { label: 'Sample Collection', icon: '▤', route: null, enabled: false },
      { label: 'Test Processing', icon: '⌕', route: null, enabled: false },
      { label: 'Results', icon: '▥', route: null, enabled: false }
    ],

    PHARMACIST: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      { label: 'Medicines', icon: '✚', route: null, enabled: false },
      { label: 'Inventory', icon: '▤', route: null, enabled: false },
      { label: 'Dispensing', icon: '▣', route: null, enabled: false },
      { label: 'Stock Alerts', icon: '⚠', route: null, enabled: false }
    ],

    ACCOUNTANT: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      { label: 'Invoices', icon: '▤', route: null, enabled: false },
      { label: 'Payments', icon: '₹', route: null, enabled: false },
      { label: 'Outstanding Balances', icon: '▣', route: null, enabled: false },
      { label: 'Financial Reports', icon: '▥', route: null, enabled: false }
    ],

    PATIENT: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      { label: 'My Appointments', icon: '▣', route: null, enabled: false },
      { label: 'Prescriptions', icon: '✚', route: null, enabled: false },
      { label: 'Lab Reports', icon: '⚗', route: null, enabled: false },
      { label: 'Medical History', icon: '▤', route: null, enabled: false },
      { label: 'My Invoices', icon: '₹', route: null, enabled: false }
    ]
  };

  readonly navigation = computed(() => {
    const role = this.currentRole();

    return role
      ? this.navigationByRole[role]
      : [];
  });

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  toggleDoctors(): void {
    this.doctorsExpanded = !this.doctorsExpanded;
  }
}