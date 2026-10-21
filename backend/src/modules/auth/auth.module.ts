import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PasswordResetToken } from "../../database/entities/password-reset-token.entity.js";
import { MailModule } from "../mail/mail.module.js";
import { UsersModule } from "../users/users.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { PasswordResetTokensService } from "./password-reset-tokens.service.js";

@Module({
  imports: [UsersModule, MailModule,TypeOrmModule.forFeature([PasswordResetToken])],
  controllers: [AuthController],
  providers: [AuthService, PasswordResetTokensService],
})
export class AuthModule {}
