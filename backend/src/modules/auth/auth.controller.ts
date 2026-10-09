import { Body, Controller, Get, Param, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { ForgotPasswordDto } from "./dto/forgot-password.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { ResetPasswordDto } from "./dto/reset-password.dto.js";
import { SignupDto } from "./dto/signup.dto.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const token = this.authService.issueAccessToken(user);
    return { user, token };
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Get("reset-password/:token")
  checkResetToken(@Param("token") token: string) {
    return this.authService.checkResetTokenEligibility(token);
  }

  @Post("reset-password/:token")
  async resetPassword(@Param("token") token: string, @Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(token, dto);
    return { success: true };
  }
}
