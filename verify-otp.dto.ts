// src/otp/dto/verify-otp.dto.ts
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(4, 6)
  otp: string;
}
