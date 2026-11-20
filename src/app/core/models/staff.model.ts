export type StaffRole =
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'PHARMACIST'
  | 'LAB_TECHNICIAN'
  | 'ACCOUNTANT';

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: StaffRole;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface CreateStaffRequest {
  email: string;
  firstName: string;
  lastName: string;
  temporaryPassword: string;
  role: StaffRole;
  phone?: string;
}
