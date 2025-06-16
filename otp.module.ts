import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from '../database/schemas/otp.schema';
import { User, UserSchema } from '../database/schemas/user.schema'; // Add this import
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { UsersService } from '../users/users.service';
import { EmailModule } from 'src/email/email.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailModule,
  ],
  providers: [OtpService, UsersService, JwtService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}
