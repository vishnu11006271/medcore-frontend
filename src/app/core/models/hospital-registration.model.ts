export interface HospitalRegistrationRequest {
  hospitalName: string;
  slug: string;
  hospitalEmail: string;
  registrationNumber?: string;
  hospitalPhone?: string;
  address?: string;

  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone?: string;
  password: string;
}

export interface HospitalRegistrationResponse {
  hospital: {
    id: string;
    name: string;
    slug: string;
    status: 'PENDING';
  };
  admin: {
    id: string;
    email: string;
    role: 'HOSPITAL_ADMIN';
  };
  otpExpiresAt: string;
}