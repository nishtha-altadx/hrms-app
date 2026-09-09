import { ConflictException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsersService } from "../users/users.service.js";
import { SignupDto } from "./dto/signup.dto.js";
import { JwtPayload, SafeUser, sanitizeUser } from "./types/auth.types.js";

const PASSWORD_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignupDto): Promise<SafeUser> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);
    const user = await this.usersService.createUser({ email: dto.email, passwordHash });
    return sanitizeUser(user);
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
}
