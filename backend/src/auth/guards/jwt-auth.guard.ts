import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import jwt from "jsonwebtoken";
import { UsersService } from "../../users/users.service.js";
import { JwtPayload, sanitizeUser } from "../types/auth.types.js";

interface RequestWithUser extends Request {
  user: ReturnType<typeof sanitizeUser>;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.cookies?.token;

    if (!token) {
      throw new UnauthorizedException("Not logged in");
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, this.configService.getOrThrow<string>("JWT_SECRET")) as JwtPayload;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    request.user = sanitizeUser(user);
    return true;
  }
}
