import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum UserRole {
  ADMIN = "admin",
  SUPERVISOR = "supervisor",
  EMPLOYEE = "employee",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ name: "password_hash", type: "varchar", nullable: true })
  passwordHash: string | null;

  @Column({ type: "enum", enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @Column({ name: "first_name", type: "varchar", nullable: true })
  firstName: string | null;

  @Column({ name: "last_name", type: "varchar", nullable: true })
  lastName: string | null;

  @Column({ name: "phone", type: "varchar", nullable: true })
  phone: string | null;

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth: string | null;

  @Column({ type: "enum", enum: Gender, nullable: true })
  gender: Gender | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
