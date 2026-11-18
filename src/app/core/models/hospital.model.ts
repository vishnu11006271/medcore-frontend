export interface Hospital {
  id: string;
  name: string;
  slug: string;
  email: string;
  registrationNumber: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  verifiedAt?: string | null;
  verifiedById?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateHospitalRequest {
  name: string;
  slug: string;
  email: string;
  registrationNumber?: string;
  phone?: string;
  address?: string;
}

export type HospitalStatus =
  | 'PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED';

