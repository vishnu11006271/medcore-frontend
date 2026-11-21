import { ApiResponse } from './auth.model';

export type HospitalAppointmentStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface HospitalDashboardOverview {
  hospital: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: string;
  };
  statistics: {
    totalPatients: number;
    totalDoctors: number;
    totalDepartments: number;
    totalAppointments: number;
    todayAppointments: number;
  };
  appointments: {
    byStatus: Record<HospitalAppointmentStatus, number>;
  };
}

export type HospitalDashboardResponse =
  ApiResponse<HospitalDashboardOverview>;
