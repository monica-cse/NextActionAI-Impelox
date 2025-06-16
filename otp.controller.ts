import {
  Body,
  Controller,
  Post,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { UsersService } from 'src/users/users.service';
import { VerifyOtpDto } from 'src/auth/dto/verify-otp.dto';
import { SendOtpDto } from 'src/auth/dto/send-otp.dto';

@Controller('otp')
export class OtpController {
  private readonly logger = new Logger(OtpController.name);

  constructor(
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    const { email } = sendOtpDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      throw new BadRequestException('User with this email does not exist');
    }

    try {
      this.logger.log(`Sending OTP to ${email}`);
      await this.otpService.sendOtp(email);
      this.logger.log(`OTP sent to ${email}`);
      return { message: 'OTP sent to your email' };
    } catch (error) {
      console.error('OTP sending failed:', error);
      if (error instanceof BadRequestException) {
        this.logger.warn(`Bad request while sending OTP: ${error.message}`);
        throw error;
      }

      this.logger.error(
        `Failed to send OTP to ${email}`,
        error instanceof Error ? error.stack || error.message : String(error),
      );
      throw new InternalServerErrorException(
        'Failed to send OTP. Please try again later.',
      );
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    try {
      this.logger.log(`Verifying OTP for ${email}`);
      const isValid = await this.otpService.verifyOtp(email, otp);

      if (!isValid) {
        this.logger.warn(`Invalid or expired OTP for ${email}`);
        throw new BadRequestException('Invalid or expired OTP');
      }

      const payload = { email };
      const secret = process.env.JWT_RESET_SECRET;

      if (!secret) {
        this.logger.error('JWT_RESET_SECRET is not defined');
        throw new InternalServerErrorException('Missing JWT_RESET_SECRET');
      }

      const resetToken = this.jwtService.sign(payload, {
        expiresIn: '10m',
        secret: process.env.JWT_RESET_SECRET,
      });

      this.logger.log(`OTP verified for ${email}`);
      return {
        resetToken,
        message: 'OTP verified successfully',
      };
    } catch (error) {
      this.logger.error(
        `OTP verification failed for ${email}`,
        error instanceof Error ? error.stack || error.message : String(error),
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('OTP verification failed');
    }
  }
}
