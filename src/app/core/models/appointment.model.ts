export interface CreateAppointmentRequest {
  hospitalId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes?: number;
  reason?: string;
}

export interface Appointment {
  id: string;
  hospitalId: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'PENDING'
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface AppointmentDoctor {
  id: string;
  specialization: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export interface AppointmentHospital {
  id: string;
  name: string;
}

export interface AppointmentDepartment {
  id: string;
  name: string;
}

export interface MyAppointment extends Appointment {
  doctor: AppointmentDoctor;
  hospital: AppointmentHospital;
  department: AppointmentDepartment;
}

export interface DoctorAppointment {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;

  patient: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };

  hospital: AppointmentHospital;
  department: AppointmentDepartment;
}

export interface HospitalAppointment {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason?: string | null;
  notes?: string | null;
  createdAt: string;

  patient: {
    id: string;
    patientNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
  };

  doctor: {
    id: string;
    specialization: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };

  department: {
    id: string;
    name: string;
  };
}

export interface HospitalAppointmentsData {
  appointments: HospitalAppointment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  
}

export interface HospitalAppointmentDetails {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;

  patient: {
    id: string;
    patientNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
  };

  doctor: {
    id: string;
    specialization: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
  };

  department: {
    id: string;
    name: string;
  };
}