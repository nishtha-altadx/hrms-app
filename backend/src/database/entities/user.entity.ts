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

  @Column({ name: "google_id", type: "varchar", unique: true, nullable: true })
  googleId: string | null;

  @Column({ name: "refresh_token_hash", type: "varchar", nullable: true })
  refreshTokenHash: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt: Date;
}
