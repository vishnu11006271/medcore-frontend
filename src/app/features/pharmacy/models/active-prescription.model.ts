export interface ActivePrescriptionItem {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName: string | null;
  strength: string | null;
  dosage: string;
  frequency: string;
  durationDays: number | null;
  prescribedQuantity: number;
  dispensedQuantity: number;
  remainingQuantity: number;
  instructions: string | null;
  isActive: boolean;
}

export interface ActivePrescription {
  id: string;
  status: string;
  createdAt: string;
  notes: string | null;

  patient: {
    id: string;
    patientNumber: string;
    firstName: string;
    lastName: string;
  };

  doctor: {
    id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };

  items: ActivePrescriptionItem[];
}