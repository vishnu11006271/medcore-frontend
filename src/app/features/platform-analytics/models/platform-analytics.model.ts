
export type HospitalStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'SUSPENDED'
  | 'REJECTED';

export type AppointmentStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'LAB_TECHNICIAN'
  | 'PHARMACIST'
  | 'ACCOUNTANT'
  | 'PATIENT';

export interface HospitalStatusCounts {
  PENDING: number;
  VERIFIED: number;
  SUSPENDED: number;
  REJECTED: number;
}

export interface UserRoleCounts {
  SUPER_ADMIN: number;
  HOSPITAL_ADMIN: number;
  DOCTOR: number;
  NURSE: number;
  RECEPTIONIST: number;
  LAB_TECHNICIAN: number;
  PHARMACIST: number;
  ACCOUNTANT: number;
  PATIENT: number;
}

export interface AppointmentStatusCounts {
  PENDING: number;
  SCHEDULED: number;
  CONFIRMED: number;
  CHECKED_IN: number;
  IN_PROGRESS: number;
  COMPLETED: number;
  CANCELLED: number;
  NO_SHOW: number;
}

export interface TopHospital {
  id: string;
  name: string;
  slug: string;
  status: HospitalStatus;
  totalAppointments: number;
  totalPatients: number;
  totalUsers: number;
  totalDepartments: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface PlatformAnalyticsTrends {
  startDate: string;
  endDate: string;
  hospitals: TrendPoint[];
  users: TrendPoint[];
  appointments: TrendPoint[];
}

export interface PlatformAnalytics {
  hospitals: {
    total: number;
    byStatus: HospitalStatusCounts;
  };

  users: {
    total: number;
    byRole: UserRoleCounts;
    patients: number;
    doctors: number;
    hospitalAdmins: number;
  };

  appointments: {
    total: number;
    byStatus: AppointmentStatusCounts;
  };

  departments: {
    total: number;
    active: number;
    inactive: number;
  };

  topHospitals: TopHospital[];

  trends: PlatformAnalyticsTrends;
}
