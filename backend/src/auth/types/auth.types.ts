import { User, UserRole } from "../../database/entities/user.entity.js";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export type SafeUser = Pick<
  User,
  | "id"
  | "email"
  | "role"
  | "isActive"
  | "firstName"
  | "lastName"
  | "phone"
  | "dateOfBirth"
  | "gender"
>;

export function sanitizeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
  };
}
