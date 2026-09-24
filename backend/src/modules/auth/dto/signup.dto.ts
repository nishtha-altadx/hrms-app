import { IsDateString, IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Gender } from "../../../database/entities/user.entity.js";

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  password: string;

  @IsString()
  @MinLength(1, { message: "First name is required" })
  firstName: string;

  @IsString()
  @MinLength(1, { message: "Last name is required" })
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;
}
