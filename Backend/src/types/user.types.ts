import { UserRole } from "@prisma/client";

export interface UpdateUserDTO {
  name?: string;
  phone?: string;
  email?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
