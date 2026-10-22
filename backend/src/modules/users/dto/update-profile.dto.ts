import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { Gender } from "../../../database/entities/user.entity.js";

const trim = ({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value);

// Optional fields accept `null` (via @IsOptional) so the client can clear them.
export class UpdateProfileDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: "First name is required" })
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MinLength(1, { message: "Last name is required" })
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @Transform(trim)
  @Matches(/^\+?[0-9\s\-()]{7,15}$/, { message: "Enter a valid phone number" })
  phone?: string | null;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string | null;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender | null;
}
