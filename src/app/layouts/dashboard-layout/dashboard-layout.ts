import { Component, ElementRef, ViewChild, computed, inject } from '@angular/core';
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

  sidebarOpen = false;

  @ViewChild('contentArea') private contentArea?: ElementRef<HTMLElement>;

  private groupExpandedState: Record<string, boolean> = {};

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

  // Role-specific navigation. Items without a route remain disabled
  // until their corresponding feature is available.
  private readonly navigationByRole: Record<UserRole, NavigationItem[]> = {
    SUPER_ADMIN: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      { label: 'Hospitals', icon: '✚', route: '/dashboard/hospitals', enabled: true },
      { label: 'Departments', icon: '▤', route: '/dashboard/departments', enabled: true },
      { label: 'Platform Users', icon: '♙', route: '/dashboard/users', enabled: true },
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
      }
    ],

    HOSPITAL_ADMIN: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      {
        label: 'Appointments',
        icon: '▣',
        route: '/dashboard/hospital-appointments',
        enabled: true
      },
      {
        label: 'Staff',
        icon: '♙',
        route: '/dashboard/staff',
        enabled: true
      },
      {
        label: 'Patients',
        icon: '♙',
        route: '/dashboard/patients',
        enabled: true
      },
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
      {
        label: 'Laboratory',
        icon: '⚗',
        route: '/dashboard/laboratory',
        enabled: true
      },
      {
        label: 'Laboratory Tests',
        icon: '🧪',
        route: '/dashboard/laboratory-tests',
        enabled: true
      },
      {
        label: 'Pharmacy',
        icon: '✚',
        route: '/dashboard/pharmacy/medicines',
        enabled: true
      },
      {
        label: 'Prescription Queue',
        icon: '▣',
        route: '/dashboard/pharmacy/prescriptions/active',
        enabled: true
      },
      {
        label: 'Billing',
        icon: '₹',
        route: '/dashboard/billing',
        enabled: true,
        children: [
          {
            label: 'Billing Dashboard',
            icon: '▦',
            route: '/dashboard/billing',
            enabled: true
          },
          {
            label: 'Invoices',
            icon: '▤',
            route: '/dashboard/billing/invoices',
            enabled: true
          }
        ]
      },
      { label: 'Reports', icon: '▥', route: null, enabled: false }
    ],

    DOCTOR: [
      {
        label: 'Dashboard',
        icon: '▦',
        route: '/dashboard',
        enabled: true
      },
      {
        label: 'Appointments',
        icon: '▣',
        route: '/dashboard/doctor-appointments',
        enabled: true
      },
      {
        label: 'My Patients',
        icon: '♙',
        route: '/dashboard/doctor-patients',
        enabled: true
      },
      {
        label: 'Medical Records',
        icon: '▤',
        route: '/dashboard/doctor-medical-records',
        enabled: true
      },
      {
        label: 'Prescriptions',
        icon: '✚',
        route: null,
        enabled: false
      },
      {
        label: 'Lab Results',
        icon: '⚗',
        route: null,
        enabled: false
      }
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
      {
        label: 'Laboratory Orders',
        icon: '🧪',
        route: '/dashboard/laboratory-orders',
        enabled: true
      },
      { label: 'Sample Collection', icon: '▤', route: null, enabled: false },
      { label: 'Test Processing', icon: '⌕', route: null, enabled: false },
      { label: 'Results', icon: '▥', route: null, enabled: false }
    ],

    PHARMACIST: [
      {
        label: 'Dashboard',
        icon: '▦',
        route: '/dashboard',
        enabled: true
      },
      {
        label: 'Medicines',
        icon: '✚',
        route: '/dashboard/pharmacy/medicines',
        enabled: true
      },
      {
        label: 'Inventory',
        icon: '▤',
        route: null,
        enabled: false
      },
      {
        label: 'Prescription Queue',
        icon: '▣',
        route: '/dashboard/pharmacy/prescriptions/active',
        enabled: true
      },
      {
        label: 'Stock Alerts',
        icon: '⚠',
        route: null,
        enabled: false
      }
    ],

    // ACCOUNTANT: [
    //   { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
    //   { label: 'Invoices', icon: '▤', route: null, enabled: false },
    //   { label: 'Payments', icon: '₹', route: null, enabled: false },
    //   { label: 'Outstanding Balances', icon: '▣', route: null, enabled: false },
    //   { label: 'Financial Reports', icon: '▥', route: null, enabled: false }
    // ],
    ACCOUNTANT: [
      {
        label: 'Dashboard',
        icon: '▦',
        route: '/dashboard',
        enabled: true
      },
      {
        label: 'Billing',
        icon: '₹',
        route: '/dashboard/billing',
        enabled: true,
        children: [
          {
            label: 'Billing Dashboard',
            icon: '▦',
            route: '/dashboard/billing',
            enabled: true
          },
          {
            label: 'Invoices',
            icon: '▤',
            route: '/dashboard/billing/invoices',
            enabled: true
          }
        ]
      }
    ],

    PATIENT: [
      { label: 'Dashboard', icon: '▦', route: '/dashboard', enabled: true },
      {
        label: 'Book Appointment',
        icon: '▣',
        route: '/dashboard/appointments/book',
        enabled: true
      },
      {
        label: 'My Appointment',
        icon: '▣',
        route: '/dashboard/my-appointments',
        enabled: true
      },
      { label: 'Prescriptions', icon: '✚', route: null, enabled: false },
      { label: 'Lab Reports', icon: '⚗', route: '/dashboard/my-lab-results', enabled: true },
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

  scrollContentToTop(): void {
    this.contentArea?.nativeElement.scrollTo({ top: 0, behavior: 'auto' });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  toggleGroup(item: NavigationItem): void {
    this.groupExpandedState = {
      ...this.groupExpandedState,
      [item.label]: !this.isGroupExpanded(item)
    };
  }

  isGroupExpanded(item: NavigationItem): boolean {
    if (Object.prototype.hasOwnProperty.call(this.groupExpandedState, item.label)) {
      return this.groupExpandedState[item.label];
    }

    return this.isGroupActive(item);
  }

  isGroupActive(item: NavigationItem): boolean {
    const currentPath = this.router.url.split(/[?#]/)[0];

    return (item.children ?? []).some(child =>
      !!child.route &&
      (currentPath === child.route || currentPath.startsWith(`${child.route}/`))
    );
  }

  get currentPageTitle(): string {
    const currentPath = this.router.url.split(/[?#]/)[0];
    const items = this.navigation().flatMap(item => [
      item,
      ...(item.children ?? [])
    ]);

    const activeItem = items
      .filter(item =>
        !!item.route &&
        (currentPath === item.route || currentPath.startsWith(`${item.route}/`))
      )
      .sort((a, b) => (b.route?.length ?? 0) - (a.route?.length ?? 0))[0];

    return activeItem?.label ?? 'Dashboard';
  }
}