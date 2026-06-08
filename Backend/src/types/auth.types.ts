import { UserRole } from "@prisma/client";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      role: UserRole;
    };
    token: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}
