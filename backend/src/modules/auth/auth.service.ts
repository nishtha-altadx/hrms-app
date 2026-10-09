import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsersService } from "../users/users.service.js";
import { ForgotPasswordDto } from "./dto/forgot-password.dto.js";
import { ResetPasswordDto } from "./dto/reset-password.dto.js";
import { SignupDto } from "./dto/signup.dto.js";
import { JwtPayload, SafeUser, sanitizeUser } from "./types/auth.types.js";
import {
  PasswordResetTokensService,
  ResetTokenIneligibleReason,
} from "./password-reset-tokens.service.js";

const PASSWORD_SALT_ROUNDS = 10;

const RESET_TOKEN_ERROR_MESSAGES: Record<ResetTokenIneligibleReason, string> = {
  not_found: "This reset link is invalid.",
  expired: "This reset link has expired. Please request a new one.",
  used: "This reset link has already been used.",
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordResetTokensService: PasswordResetTokensService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignupDto): Promise<{ accessToken: string; user: { id: string; email: string } }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
    });

    const safeUser = sanitizeUser(user);
    const accessToken = this.issueAccessToken(safeUser);

    return {
      accessToken,
      user: { id: safeUser.id, email: safeUser.email },
    };
  }

  async validateUser(email: string, password: string): Promise<SafeUser | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return null;
    }

    return sanitizeUser(user);
  }

  issueAccessToken(user: SafeUser): string {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    return jwt.sign(payload, this.configService.getOrThrow<string>("JWT_SECRET"), {
      expiresIn: this.configService.get<string>("JWT_EXPIRES_IN", "1d") as `${number}${"s" | "m" | "h" | "d"}`,
    });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const genericResponse = {
      message: "If that email is registered, a password reset link has been sent.",
    };

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return genericResponse;
    }

    const rawToken = await this.passwordResetTokensService.createForUser(user.id);
    const frontendUrl = this.configService.get<string>("FRONTEND_URL", "http://localhost:3000");
    const resetLink = `${frontendUrl}/reset-password/${rawToken}`;

    // Dev-only: log the link instead of sending a real email.
    console.log(`Password reset link for ${user.email}: ${resetLink}`);

    return genericResponse;
  }

  async checkResetTokenEligibility(
    rawToken: string,
  ): Promise<{ valid: true } | { valid: false; reason: ResetTokenIneligibleReason }> {
    const result = await this.passwordResetTokensService.checkEligibility(rawToken);
    if (!result.valid) {
      return { valid: false, reason: result.reason };
    }
    return { valid: true };
  }

  async resetPassword(rawToken: string, dto: ResetPasswordDto): Promise<void> {
    const result = await this.passwordResetTokensService.checkEligibility(rawToken);
    if (!result.valid) {
      throw new BadRequestException(RESET_TOKEN_ERROR_MESSAGES[result.reason]);
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    await this.usersService.updatePasswordHash(result.token.userId, passwordHash);
    await this.passwordResetTokensService.markUsed(result.token.id);
  }
}
