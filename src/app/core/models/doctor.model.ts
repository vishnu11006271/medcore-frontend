export interface Doctor {
  id: string;
  departmentId: string | null;
  licenseNumber: string;
  specialization: string;
  qualification: string | null;
  experienceYears: number;
  consultationFee: string;
  bio: string | null;
  createdAt: string;
  updatedAt?: string;

  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role?: string;
    isActive: boolean;
    emailVerifiedAt: string | null;
    hospitalId?: string | null;
  };

  department: {
    id: string;
    name: string;
    code: string;
  } | null;
}

export interface CreateDoctorRequest {
  email: string;
  temporaryPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  departmentId?: string;
  licenseNumber: string;
  specialization: string;
  qualification?: string;
  experienceYears: number;
  consultationFee: number;
  bio?: string;
}

export interface UpdateDoctorRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  departmentId?: string | null;
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  bio?: string;
}

export interface HospitalOption {
  id: string;
  name: string;
  status: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}
