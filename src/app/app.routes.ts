import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { UserRole } from './core/models/auth.model';
import { AvailabilityManagementComponent } from
  './features/availability/pages/availability-management/availability-management';

const allRoles: UserRole[] = [
  'SUPER_ADMIN',
  'HOSPITAL_ADMIN',
  'DOCTOR',
  'NURSE',
  'RECEPTIONIST',
  'LAB_TECHNICIAN',
  'PHARMACIST',
  'ACCOUNTANT',
  'PATIENT'
];

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login')
        .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: { roles: allRoles },
    loadComponent: () =>
      import('./layouts/dashboard-layout/dashboard-layout')
        .then(m => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'hospitals',
        canActivate: [roleGuard],
        data: {
          roles: ['SUPER_ADMIN']
        },
        loadComponent: () =>
          import('./features/hospitals/pages/hospitals-list/hospitals-list')
            .then(m => m.HospitalsList)
      },
      {
        path: 'departments',
        canActivate: [roleGuard],
        data: {
          roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import('./features/departments/pages/departments-list/departments-list')
            .then(m => m.DepartmentsListComponent)
      },
      {
        path: 'doctors',
        canActivate: [roleGuard],
        data: {
          roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import('./features/doctors/pages/doctors-list/doctors-list')
            .then(m => m.DoctorsList)
      },
      {
        path: 'availability',
        canActivate: [roleGuard],
        data: {
          roles: ['SUPER_ADMIN', 'HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import('./features/availability/pages/availability-management/availability-management')
            .then(m => m.AvailabilityManagementComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];