import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { UserRole } from './core/models/auth.model';

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
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email')
        .then(m => m.VerifyEmailComponent)
  },
  {
    path: 'register-hospital',
    loadComponent: () =>
      import('./features/hospitals/pages/hospital-registration/hospital-registration')
        .then(m => m.HospitalRegistrationComponent)
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
      },
      {
      path: 'appointments/book',
      loadComponent: () =>
        import('./features/appointments/pages/appointment-booking/appointment-booking')
          .then(m => m.AppointmentBookingComponent)
      },
      {
        path: 'my-appointments',
        canActivate: [roleGuard],
        data: { roles: ['PATIENT'] },
        loadComponent: () =>
          import('./features/patient/my-appointments/my-appointments')
            .then(m => m.MyAppointmentsComponent)
      },
      {
        path: 'appointments/:id',
        canActivate: [roleGuard],
        data: { roles: ['PATIENT'] },
        loadComponent: () =>
          import('./features/patient/appointment-details/appointment-details')
            .then(m => m.AppointmentDetails)
      },
      {
        path: 'doctor-appointments',
        loadComponent: () =>
          import('./features/doctors/pages/doctor-appointments/doctor-appointments')
            .then(m => m.DoctorAppointments),
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR'] }
      },
      {
        path: 'staff',
        canActivate: [roleGuard],
        data: { roles: ['HOSPITAL_ADMIN'] },
        loadComponent: () =>
          import('./features/hospital-admin/staff/staff-management')
            .then(m => m.StaffManagementComponent)
      },
      {
        path: 'patients',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import('./features/hospital-admin/patients/pages/patient-list/patient-list')
            .then(m => m.PatientListComponent)
      },
      {
        path: 'patients/:id',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import('./features/hospital-admin/patients/pages/patient-details/patient-details')
            .then(m => m.PatientDetailsComponent)
      },
      {
        path: 'hospital-appointments',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import('./features/hospital-admin/appointments/pages/appointment-list/appointment-list')
            .then(m => m.AppointmentListComponent)
      },
      {
        path: 'hospital-appointments/:id',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import('./features/hospital-admin/appointments/pages/appointment-details/appointment-details')
            .then(m => m.HospitalAppointmentDetailsComponent)
      },
      {
        path: 'laboratory',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import('./features/hospital-admin/laboratory/pages/laboratory-dashboard/laboratory-dashboard')
            .then(m => m.LaboratoryDashboardComponent)
      },
      {
        path: 'laboratory-tests',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import(
            './features/hospital-admin/laboratory/pages/laboratory-dashboard/laboratory-tests/laboratory-tests'
          ).then(m => m.LaboratoryTestsComponent)
      },
      {
        path: 'laboratory-orders',
        canActivate: [roleGuard],
        data: {
          roles: ['LAB_TECHNICIAN']
        },
        loadComponent: () =>
          import(
            './features/lab-technician/pages/laboratory-orders/laboratory-orders'
          ).then(m => m.LaboratoryOrdersComponent)
      },
      {
        path: 'doctor-medical-records',
        canActivate: [roleGuard],
        data: { roles: ['DOCTOR'] },
        loadComponent: () =>
          import(
            './features/doctors/pages/doctor-medical-records/doctor-medical-records'
          ).then(m => m.DoctorMedicalRecords)
      },
      {
        path: 'my-lab-results',
        loadComponent: () =>
          import('./features/patient/patient-lab-results/patient-lab-results')
            .then(m => m.PatientLabResults),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['PATIENT'] }
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: {
          roles: ['SUPER_ADMIN']
        },
        loadComponent: () =>
          import('./features/users/pages/users-list/users-list')
            .then(m => m.UsersList)
      },
      // Pharmacy - Medicine Catalogue
      {
        path: 'pharmacy/medicines',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN', 'PHARMACIST', 'DOCTOR']
        },
        loadComponent: () =>
          import('./features/pharmacy/medicine-list/medicine-list')
            .then(m => m.MedicineListComponent)
      },

      // Pharmacy - Create Medicine
      {
        path: 'pharmacy/medicines/new',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import('./features/pharmacy/medicine-form/medicine-form')
            .then(m => m.MedicineFormComponent)
      },

      // Pharmacy - Edit Medicine
      {
        path: 'pharmacy/medicines/:id/edit',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN']
        },
        loadComponent: () =>
          import('./features/pharmacy/medicine-form/medicine-form')
            .then(m => m.MedicineFormComponent)
      },

      // Pharmacy - Medicine Batches
      {
        path: 'pharmacy/medicines/:id/batches',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN', 'PHARMACIST']
        },
        loadComponent: () =>
          import('./features/pharmacy/medicine-batches/medicine-batches')
            .then(m => m.MedicineBatchesComponent)
      },
      {
        path: 'pharmacy/stock/receive',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN', 'PHARMACIST']
        },
        loadComponent: () =>
          import('./features/pharmacy/receive-stock/receive-stock')
            .then(m => m.ReceiveStockComponent)
      },
      {
        path: 'pharmacy/stock/receive/:medicineId',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN', 'PHARMACIST']
        },
        loadComponent: () =>
          import('./features/pharmacy/receive-stock/receive-stock')
            .then(m => m.ReceiveStockComponent)
      },
      {
        path: 'pharmacy/prescriptions/active',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN', 'PHARMACIST']
        },
        loadComponent: () =>
          import('./features/pharmacy/prescription-queue/prescription-queue')
            .then(m => m.PrescriptionQueueComponent)
      },

      {
        path: 'billing',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN', 'ACCOUNTANT']
        },
        loadComponent: () =>
          import('./features/billing/pages/billing-dashboard/billing-dashboard')
            .then(m => m.BillingDashboardComponent)
      },
      {
        path: 'billing/invoices',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN', 'ACCOUNTANT']
        },
        loadComponent: () =>
          import('./features/billing/pages/invoice-list/invoice-list')
            .then(m => m.InvoiceListComponent)
      },
      {
        path: 'billing/invoices/new',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN', 'ACCOUNTANT']
        },
        loadComponent: () =>
          import('./features/billing/pages/create-invoice/create-invoice')
            .then(m => m.CreateInvoiceComponent)
      },
      {
        path: 'billing/invoices/:id',
        canActivate: [roleGuard],
        data: {
          roles: ['HOSPITAL_ADMIN', 'ACCOUNTANT']
        },
        loadComponent: () =>
          import('./features/billing/pages/invoice-details/invoice-details')
            .then(m => m.InvoiceDetailsComponent)
      },

      
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