import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  private generateOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  }

  async sendOtp(email: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`User not found for email: ${email}`);
      throw new BadRequestException('User not found');
    }

    if (user.otpExpiry && user.otpExpiry.getTime() > Date.now() - 60 * 1000) {
      this.logger.warn(`OTP request rate limit hit for ${email}`);
      throw new BadRequestException(
        'Too many OTP requests. Please try again in a minute.',
      );
    }

    const otp = this.generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    this.logger.log(
      `Generated OTP ${otp} for ${email}, valid until ${otpExpiry.toISOString()}`,
    );

    await this.usersService.updateByEmail(email, {
      otp,
      otpExpiry,
    });

    this.logger.log(`Saved OTP and expiration for ${email}`);
    await this.emailService.sendOtpEmail(email, otp);
    this.logger.log(`Sent OTP email to ${email}`);

    return otp;
  }

  async verifyOtp(email: string, submittedOtp: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.otp || !user.otpExpiry) {
      this.logger.warn(`No OTP data found for ${email}`);
      return false;
    }

    if (user.otp !== submittedOtp) {
      this.logger.warn(`Invalid OTP entered for ${email}`);
      return false;
    }

    if (user.otpExpiry.getTime() < Date.now()) {
      this.logger.warn(`OTP expired for ${email}`);
      return false;
    }

    await this.usersService.updateByEmail(email, {
      otp: null,
      otpExpiry: null,
    });

    this.logger.log(`OTP verified and cleared for ${email}`);
    return true;
  }
}
