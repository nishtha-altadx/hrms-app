import { Body, Controller, Get, Patch, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { SafeUser, sanitizeUser } from "../auth/types/auth.types.js";
import { UpdateProfileDto } from "./dto/update-profile.dto.js";
import { UsersService } from "./users.service.js";

interface RequestWithUser {
  user: SafeUser;
}

@Controller("profile")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req: RequestWithUser) {
    return { user: req.user };
  }

  // No :id param: the target is always the authenticated user, so users can only edit themselves.
  // forbidNonWhitelisted makes attempts to send email/role/etc. a 400 rather than a silent no-op.
  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    dto: UpdateProfileDto,
  ) {
    const user = await this.usersService.updateProfile(req.user.id, dto);
    return { user: sanitizeUser(user) };
  }
}
