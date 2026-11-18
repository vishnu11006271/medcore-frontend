export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PatientUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface Patient {
  id: string;
  patientNumber: string;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  address: string | null;
  emergencyContact: string | null;
  createdAt: string;
  updatedAt?: string;
  user: PatientUser;
}

export interface PatientListData {
  patients: Patient[];
  pagination: Pagination;
}

export interface PatientAppointment {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  reason: string | null;
  notes: string | null;
  createdAt: string;

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

export interface PatientAppointmentsData {
  patient: {
    id: string;
    patientNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  appointments: PatientAppointment[];
  pagination: Pagination;
}

export interface PatientMedicalRecord {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string | null;
  symptoms: string | null;
  clinicalNotes: string | null;
  treatmentPlan: string | null;
  status: string;
  recordedAt: string;
  updatedAt: string;

  doctor: {
    id: string;
    specialization: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };

  appointment: {
    id: string;
    scheduledAt: string;
    status: string;
    reason: string | null;
  };
}

export interface PatientMedicalRecordsData {
  patient: {
    id: string;
    patientNumber: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  records: PatientMedicalRecord[];
  pagination: Pagination;
}