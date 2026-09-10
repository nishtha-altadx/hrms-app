import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "./guards/jwt-auth.guard.js";
import { SafeUser } from "./types/auth.types.js";

interface RequestWithUser {
  user: SafeUser;
}

@Controller("profile")
export class ProfileController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req: RequestWithUser) {
    return { user: req.user };
  }
}
