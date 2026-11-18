export type MedicalRecordStatus = 'DRAFT' | 'FINALIZED';

export interface CreateMedicalRecordRequest {
  appointmentId: string;
  diagnosis?: string;
  symptoms?: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
}

export interface UpdateMedicalRecordRequest {
  diagnosis?: string;
  symptoms?: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
}

export interface MedicalRecord {
  id: string;
  appointmentId: string;
  hospitalId: string;
  patientId: string;
  doctorId: string;
  diagnosis?: string | null;
  symptoms?: string | null;
  clinicalNotes?: string | null;
  treatmentPlan?: string | null;
  status: MedicalRecordStatus;
  recordedAt: string;
  updatedAt: string;

  patient?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };

  appointment?: {
    id: string;
    scheduledAt: string;
    status: string;
  };
}

export interface CreateVitalSignRequest {
  systolicBP?: number;
  diastolicBP?: number;
  pulseBpm?: number;
  temperatureC?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  heightCm?: number;
  weightKg?: number;
  notes?: string;
}

export interface VitalSign {
  id: string;
  medicalRecordId: string;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  pulseBpm?: number | null;
  temperatureC?: number | null;
  respiratoryRate?: number | null;
  oxygenSaturation?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  notes?: string | null;
  recordedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}