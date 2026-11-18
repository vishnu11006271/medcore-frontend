export interface DispensePrescriptionItemRequest {
  prescriptionItemId: string;
  quantity: number;
}

export interface DispensePrescriptionRequest {
  prescriptionId: string;
  items: DispensePrescriptionItemRequest[];
  notes?: string;
}