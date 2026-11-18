export interface MedicineBatch {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantityReceived: number;
  quantityAvailable: number;
  purchasePrice: number | string;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  hospitalId: string;
  name: string;
  genericName: string | null;
  strength: string | null;
  manufacturer: string | null;
  stockQuantity: number;
  unitPrice: number | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  batches?: MedicineBatch[];
}

export interface CreateMedicineRequest {
  name: string;
  genericName?: string;
  strength?: string;
  manufacturer?: string;
  unitPrice: number;
}

export interface UpdateMedicineRequest {
  name?: string;
  genericName?: string;
  strength?: string;
  manufacturer?: string;
  unitPrice?: number;
  isActive?: boolean;
}

export type MedicineStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface ReceiveStockRequest {
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantityReceived: number;
  purchasePrice?: number;
}