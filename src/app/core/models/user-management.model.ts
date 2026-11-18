import { UserRole } from "./auth.model";


export interface PlatformUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;

  hospital: {
    id: string;
    name: string;
    status: string;
  } | null;
}

export interface UsersQuery {
  search?: string;
  role?: UserRole | '';
  hospitalId?: string;
  isActive?: string;
  emailVerified?: string;
  page?: number;
  limit?: number;
}

export interface UsersPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsersListData {
  users: PlatformUser[];
  pagination: UsersPagination;
}