import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { EmailService } from 'src/email/email.service';
import { randomInt } from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { email, password } = createUserDto;

      const existingUser = await this.userModel.findOne({ email }).exec();
      if (existingUser) {
        this.logger.log(`ConflictException: Email already exists: ${email}`);
        throw new ConflictException('Email already exists');
      }
      if (!password) {
        throw new BadRequestException('Password is required');
      }

      const salt = await bcrypt.genSalt(10);
      if (!salt) {
        throw new InternalServerErrorException('Failed to generate salt');
      }

      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });

      this.logger.log(`Creating new user with email: ${email}`);
      return await newUser.save();
    } catch (error) {
      this.logger.error(
        'Failed to create user',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      this.logger.log(`Finding user by email: ${email}`);
      return await this.userModel.findOne({ email }).exec();
    } catch (error) {
      this.logger.error(
        'Failed to find user by email',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      throw new InternalServerErrorException('Failed to find user by email');
    }
  }

  async findById(id: string): Promise<User> {
    try {
      this.logger.log(`Finding user by ID: ${id}`);
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        this.logger.log(`NotFoundException: User not found with ID: ${id}`);
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(
        'Failed to find user by ID',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to find user by ID');
    }
  }

  async generatePasswordResetOtp(email: string): Promise<void> {
    try {
      this.logger.log(`Generating password reset OTP for email: ${email}`);
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        this.logger.log(
          `NotFoundException: User with this email does not exist: ${email}`,
        );
        throw new NotFoundException('User with this email does not exist');
      }

      const otp = this.generateOtp();
      const expiry = new Date(Date.now() + 15 * 60 * 1000);

      user.otp = otp;
      user.otpExpiry = expiry;
      await user.save();

      await this.emailService.sendOtpEmail(user.email, otp);

      this.logger.log(`Password reset OTP sent to ${email}`);
    } catch (error) {
      this.logger.error(
        'Failed to generate password reset OTP',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to generate password reset OTP',
      );
    }
  }

  private generateOtp(): string {
    const otp = randomInt(100000, 1_000_000).toString();
    this.logger.debug('Generated secure OTP for password reset');
    return otp;
  }

  async verifyPasswordResetOtp(email: string, otp: string): Promise<void> {
    try {
      this.logger.log(`Verifying password reset OTP for email: ${email}`);
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        this.logger.log(
          `NotFoundException: User with this email does not exist: ${email}`,
        );
        throw new NotFoundException('User with this email does not exist');
      }

      if (!user.otp || !user.otpExpiry) {
        this.logger.log(
          `BadRequestException: No OTP request found for user: ${email}`,
        );
        throw new BadRequestException('No OTP request found for this user');
      }

      if (user.otp !== otp) {
        this.logger.log(`BadRequestException: Invalid OTP for user: ${email}`);
        throw new BadRequestException('Invalid OTP');
      }

      if (user.otpExpiry < new Date()) {
        this.logger.log(`BadRequestException: OTP expired for user: ${email}`);
        throw new BadRequestException('OTP expired');
      }

      this.logger.log(`OTP verified successfully for user: ${email}`);
    } catch (error) {
      this.logger.error(
        'Failed to verify password reset OTP',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }
  async resetPassword(email: string, newPassword: string): Promise<User> {
    try {
      this.logger.log(`Resetting password for user: ${email}`);
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        this.logger.log(
          `NotFoundException: User with this email does not exist: ${email}`,
        );
        throw new NotFoundException('User with this email does not exist');
      }

      // Hash the new password before saving
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      // Clear reset OTP token and expiry to prevent reuse
      user.otp = undefined;
      user.otpExpiry = undefined;

      this.logger.log(`Password updated successfully for: ${email}`);

      return await user.save();
    } catch (error) {
      this.logger.error(
        'Failed to reset password',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async updateUser(email: string, updates: Partial<User>): Promise<User> {
    try {
      this.logger.log(`Updating user with email: ${email}`);
      const updatedUser = await this.userModel
        .findOneAndUpdate({ email }, updates, { new: true })
        .exec();
      if (!updatedUser) {
        this.logger.warn(`Update failed: User not found with email: ${email}`);
        throw new NotFoundException('User not found');
      }
      this.logger.log(`User updated successfully: ${email}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(
        'Failed to update user',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async updateByEmail(email: string, update: Partial<User>) {
    try {
      this.logger.log(`Updating user by email (shorthand): ${email}`);
      const result = await this.userModel
        .findOneAndUpdate({ email }, update, {
          new: true,
        })
        .exec();

      if (!result) {
        this.logger.warn(`User not found for email update: ${email}`);
      } else {
        this.logger.log(`User updated via updateByEmail: ${email}`);
      }
      return result;
    } catch (error) {
      this.logger.error(
        'Failed to update user by email',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      throw new InternalServerErrorException('Failed to update user');
    }
  }
  // src/users/users.service.ts

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }
  // src/users/users.service.ts

  async createFromGooglePayload(payload: any): Promise<User> {
    const createdUser = new this.userModel({
      email: payload.email,
      name: payload.name,
      googleId: payload.sub,
      authProvider: 'google',
      profilePic: payload.picture || null,
      scope: payload.scope || [],
      // Add any other fields as needed
    });
    return createdUser.save();
  }
}
