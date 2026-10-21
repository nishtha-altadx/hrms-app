import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { Transporter } from "nodemailer";

@Injectable()
export class MailService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const port = Number(this.configService.get<string>("MAIL_PORT", "465"));

    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>("MAIL_HOST"),
      port,
      secure: port === 465,
      auth: {
        user: this.configService.getOrThrow<string>("MAIL_USER"),
        pass: this.configService.getOrThrow<string>("MAIL_PASS"),
      },
    });
    this.from = this.configService.getOrThrow<string>("MAIL_FROM");
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: "Reset your HRMS password",
      text: [
        "We received a request to reset your password.",
        "",
        `Reset it here (valid for 1 hour): ${resetLink}`,
        "", 
        "If you didn't request this, you can ignore this email.",
      ].join("\n"),
      html: `
        <p>We received a request to reset your password.</p>
        <p><a href="${resetLink}">Reset your password</a> (valid for 1 hour).</p>
        <p>If you didn't request this, you can ignore this email.</p>
      `,
    });
  }
}
