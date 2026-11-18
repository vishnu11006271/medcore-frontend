export interface LaboratoryTest {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  description: string | null;
  price: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LaboratoryDashboard {
  tests: {
    total: number;
    active: number;
    inactive: number;
  };
  orders: {
    total: number;
    ordered: number;
    sampleCollected: number;
    processing: number;
    resultUploaded: number;
    approved: number;
    rejected: number;
    cancelled: number;
    completed: number;
  };
}

export interface LaboratoryDashboardResponse {
  success: boolean;
  data: LaboratoryDashboard;
  message: string;
}

export interface LaboratoryTestsResponse {
  success: boolean;
  data: LaboratoryTest[];
  message: string;
}

export interface LaboratoryTestResponse {
  success: boolean;
  data: LaboratoryTest;
  message: string;
}

export interface CreateLaboratoryTest {
  name: string;
  code: string;
  description?: string;
  price: number;
}

export interface UpdateLaboratoryTest {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

export interface LabOrderPatient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface LabOrderDoctor {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface LabOrderTest {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  price: string | number;
}

export interface LabOrderMedicalRecord {
  id: string;
  recordedAt?: string;
  diagnosis?: string;
  patient: {
    id: string;
    user: LabOrderPatient;
  };
  doctor?: {
    id: string;
    user: LabOrderDoctor;
  };
}

export type LabOrderStatus =
  | 'ORDERED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'RESULT_UPLOADED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface LaboratoryOrder {
  id: string;
  medicalRecordId: string;
  labTestId: string;
  orderedById: string;
  status: LabOrderStatus;
  notes?: string | null;
  resultText?: string | null;
  resultFileUrl?: string | null;
  orderedAt: string;
  completedAt?: string | null;
  approvalNotes?: string | null;
  approvedAt?: string | null;

  labTest: LabOrderTest;

  medicalRecord: LabOrderMedicalRecord;
}

export interface LaboratoryOrdersResponse {
  success: boolean;
  data: LaboratoryOrder[];
  message: string;
}

export interface LaboratoryOrderResponse {
  success: boolean;
  data: LaboratoryOrder;
  message: string;
}

export interface UploadLabResult {
  resultText: string;
  resultFileUrl?: string;
}

export interface CreateLaboratoryOrder {
  medicalRecordId: string;
  labTestId: string;
  notes?: string;
}

export interface ApproveLabResult {
  approvalNotes?: string | null;
  approvedAt?: string | null;
}

export interface PatientLabResult {
  id: string;
  medicalRecordId: string;
  labTestId: string;
  orderedById: string;
  status: LabOrderStatus;
  resultText: string | null;
  resultFileUrl: string | null;
  orderedAt: string;
  completedAt: string | null;
  approvedAt: string | null;
  approvalNotes: string | null;
  notes: string | null;

  labTest: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    price: string;
  };

  medicalRecord: {
    recordedAt: string;
    diagnosis: string;
  };
}