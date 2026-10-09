import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash, randomBytes } from "crypto";
import { Repository } from "typeorm";
import { PasswordResetToken } from "../../database/entities/password-reset-token.entity.js";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export type ResetTokenIneligibleReason = "not_found" | "expired" | "used";
export type ResetTokenEligibility =
  | { valid: true; token: PasswordResetToken }
  | { valid: false; reason: ResetTokenIneligibleReason };

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

@Injectable()
export class PasswordResetTokensService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly repository: Repository<PasswordResetToken>,
  ) {}

  async createForUser(userId: string): Promise<string> {
    const rawToken = randomBytes(32).toString("hex");

    const entry = this.repository.create({
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      isUsed: false,
    });
    await this.repository.save(entry);

    return rawToken;
  }

  async checkEligibility(rawToken: string): Promise<ResetTokenEligibility> {
    const token = await this.repository.findOne({ where: { tokenHash: hashToken(rawToken) } });

    if (!token) {
      return { valid: false, reason: "not_found" };
    }
    if (token.isUsed) {
      return { valid: false, reason: "used" };
    }
    if (token.expiresAt.getTime() < Date.now()) {
      return { valid: false, reason: "expired" };
    }

    return { valid: true, token };
  }

  async markUsed(id: string): Promise<void> {
    await this.repository.update(id, { isUsed: true });
  }
}
