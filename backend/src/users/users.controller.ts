import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { SafeUser } from "../auth/types/auth.types.js";

interface RequestWithUser {
  user: SafeUser;
}

@Controller("profile")
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req: RequestWithUser) {
    return { user: req.user };
  }
}
