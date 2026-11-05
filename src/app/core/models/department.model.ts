export interface Department {
  id: string;
  hospitalId: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentResponse {
  success: boolean;
  data: Department[];
  message: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code?: string;
  description?: string;
}

export interface CreateDepartmentResponse {
  success: boolean;
  data: Department;
  message: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  code?: string | null;
  description?: string | null;
}

export interface UpdateDepartmentResponse {
  success: boolean;
  data: Department;
  message: string;
}

export interface UpdateDepartmentStatusRequest {
  isActive: boolean;
}

export interface UpdateDepartmentStatusResponse {
  success: boolean;
  data: Department;
  message: string;
}