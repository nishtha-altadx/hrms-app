import { User, UserRole } from "../../database/entities/user.entity.js";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export type SafeUser = Pick<User, "id" | "email" | "role" | "isActive">;

export function sanitizeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}
