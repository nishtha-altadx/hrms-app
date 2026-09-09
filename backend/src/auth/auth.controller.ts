import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { AuthService } from "./auth.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { SignupDto } from "./dto/signup.dto.js";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { SafeUser } from "./types/auth.types.js";

interface RequestWithUser {
  user: SafeUser;
}

const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day, matches JWT_EXPIRES_IN default

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post("signup")
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const token = this.authService.issueAccessToken(user);
    const isProduction = this.configService.get<string>("NODE_ENV") === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE_MS,
    });

    return { user };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("token", { path: "/" });
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: RequestWithUser) {
    return { user: req.user };
  }
}
