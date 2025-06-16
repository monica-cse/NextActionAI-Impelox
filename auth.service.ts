import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RegisterDto } from './dto/register.dto';
import { randomInt } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/database/schemas/user.schema';

interface DecodedResetToken {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async register(registerDto: RegisterDto) {
    try {
      this.logger.log('Registering new user...');
      const user = await this.usersService.create(registerDto);
      this.logger.log(`User created with email: ${user.email}`);

      const issuedAt = Math.floor(Date.now() / 1000);
      const expiresIn = 12 * 60 * 60;

      const payload = {
        sub: user._id,
        email: user.email,
        iat: issuedAt,
      };
      const token = this.jwtService.sign(payload, {
        noTimestamp: true,
        secret: process.env.JWT_SECRET,
        expiresIn,
      });
      this.logger.log(`Access token generated for user: ${user.email}`);

      const refreshIssuedAt = Math.floor(Date.now() / 1000);
      const refreshExpiresIn = 7 * 24 * 60 * 60;
      const refreshPayload = {
        sub: user._id,
        email: user.email,
        iat: refreshIssuedAt,
      };
      const refreshToken = this.jwtService.sign(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        noTimestamp: true,
        expiresIn: refreshExpiresIn,
      });
      this.logger.log(`Refresh token generated for user: ${user.email}`);

      // Hash and store the refresh token
      const hashedRefreshToken: string = await bcrypt.hash(refreshToken, 10);
      await this.usersService.updateByEmail(user.email, {
        refreshToken: hashedRefreshToken,
      });

      return {
        user: {
          name: user.name,
          email: user.email,
        },
        token,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(
        'Error during user registration',
        error instanceof Error ? error.stack || error.message : String(error),
      );

      throw error instanceof ConflictException
        ? error
        : new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginUserDto) {
    try {
      const { email, password } = loginDto;

      // Find user by email only, never by password
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.logger.warn(`Login failed: user not found for email ${email}`);
        this.logger.error(
          `UnauthorizedException thrown: Invalid credentials for email ${email}`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      // Secure password check using bcrypt.compare
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Login failed: invalid password for email ${email}`);
        this.logger.error(
          `UnauthorizedException thrown: Invalid password attempt for email ${email}`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`Password validated for email: ${email}`);

      const issuedAt = Math.floor(Date.now() / 1000);
      const expiresIn = 12 * 60 * 60; // 12 hours in seconds

      const payload = {
        sub: user._id,
        email: user.email,
        iat: issuedAt,
      };
      const token = await this.jwtService.signAsync(payload, {
        noTimestamp: true,
        secret: process.env.JWT_SECRET,

        expiresIn, // duration, NOT absolute timestamp
      });

      const refreshIssuedAt = Math.floor(Date.now() / 1000);
      const refreshExpiresIn = 7 * 24 * 60 * 60; // 7 days in seconds
      const refreshPayload = {
        sub: user._id,
        email: user.email,
        iat: refreshIssuedAt,
      };
      const refreshToken = await this.jwtService.signAsync(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        noTimestamp: true,
        expiresIn: refreshExpiresIn, // duration again
      });
      this.logger.log(`Refresh token issued for email: ${email}`);

      const hashedRefreshToken: string = await bcrypt.hash(refreshToken, 10);
      await this.usersService.updateByEmail(email, {
        refreshToken: hashedRefreshToken,
      });
      this.logger.log(`Refresh token hashed and stored for email: ${email}`);

      this.logger.log(`Login successful for email: ${email}`);

      return {
        message: 'Login successful',
        user: { name: user.name, email: user.email },
        token,
        refreshToken,
      };
    } catch (error) {
      this.logger.error(
        'Error during login',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      throw error instanceof UnauthorizedException
        ? error
        : new InternalServerErrorException('Failed to login');
    }
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    try {
      this.logger.log(`Sending OTP to email: ${email}`);
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.logger.warn(
          `Cannot send OTP - user not found for email: ${email}`,
        );
        throw new BadRequestException('User with this email does not exist');
      }

      const otp = randomInt(100000, 1_000_000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      await this.usersService.updateUser(email, {
        otp,
        otpExpiry,
        refreshToken: undefined,
      });

      this.logger.debug(`Secure OTP generated for ${email}`);
      return { message: 'OTP sent to email' };
    } catch (error) {
      this.logger.error(
        'Error sending OTP',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }
  async verifyOtp(dto: VerifyOtpDto): Promise<{ resetToken: string }> {
    try {
      this.logger.log(`Verifying OTP for email: ${dto.email}`);
      const { email, otp } = dto;
      const user = await this.usersService.findByEmail(email);

      if (!user || !user.otp || !user.otpExpiry) {
        this.logger.warn(`OTP verification failed: no OTP sent for ${email}`);
        throw new UnauthorizedException('No OTP sent for this email');
      }

      if (user.otpExpiry.getTime() < Date.now()) {
        this.logger.warn(`OTP expired for email: ${email}`);
        throw new UnauthorizedException('OTP expired');
      }

      if (user.otp !== otp) {
        this.logger.warn(`Invalid OTP entered for email: ${email}`);
        throw new UnauthorizedException('Invalid OTP');
      }

      const resetToken = this.jwtService.sign(
        { email, purpose: 'reset-password' },
        { expiresIn: '15m' },
      );

      await this.usersService.updateUser(email, {
        otp: undefined,
        otpExpiry: undefined,
      });

      this.logger.log(`OTP successfully verified for email: ${email}`);
      return { resetToken };
    } catch (error) {
      this.logger.error(
        'Error verifying OTP',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      throw error instanceof UnauthorizedException
        ? error
        : new InternalServerErrorException('Failed to verify OTP');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      this.logger.log(
        `Forgot password request received for email: ${dto.email}`,
      );
      const { email } = dto;
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.logger.warn(
          `Forgot password failed - user not found for email: ${email}`,
        );
        throw new BadRequestException('User with this email does not exist');
      }

      return await this.sendOtp(email);
    } catch (error) {
      this.logger.error(
        'Error in forgotPassword',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      throw new InternalServerErrorException(
        'Failed to initiate password reset',
      );
    }
  }

  async resetPassword(
    dto: ResetPasswordDto,
    authHeader: string,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(`Reset password attempt for email: ${dto.email}`);
      const { email, newPassword, confirmNewPassword } = dto;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.logger.warn(
          'Authorization failed: Missing or malformed Bearer token',
        );
        this.logger.error(
          'UnauthorizedException thrown: Invalid or missing authorization header',
        );
        throw new UnauthorizedException(
          'Invalid or missing authorization header',
        );
      }

      const resetToken = authHeader.replace('Bearer ', '');

      if (newPassword !== confirmNewPassword) {
        this.logger.warn(
          `Password reset failed - passwords do not match for email: ${email}`,
        );
        throw new BadRequestException('Passwords do not match');
      }

      const jwtResetSecret = process.env.JWT_RESET_SECRET;
      if (!jwtResetSecret) {
        this.logger.error(
          'Internal server error: JWT_RESET_SECRET is not defined',
        );
        throw new InternalServerErrorException('Missing JWT_RESET_SECRET');
      }

      let decoded: DecodedResetToken;

      try {
        decoded = jwt.verify(resetToken, jwtResetSecret) as DecodedResetToken;
      } catch (error) {
        this.logger.error(
          'Invalid or expired reset token',
          error instanceof Error ? error.stack || error.message : String(error),
        );
        throw new BadRequestException('Invalid or expired token');
      }

      const user = await this.usersService.findByEmail(decoded.email); //  Use decoded.email
      if (!user) {
        this.logger.warn(
          `Password reset failed - user not found for email: ${decoded.email}`,
        );
        throw new BadRequestException('User with this email does not exist');
      }

      await this.usersService.resetPassword(email, newPassword);

      this.logger.log(`Password reset successful for email: ${email}`);
      return { message: 'Password reset successful' };
    } catch (error) {
      this.logger.error(
        'Error during password reset',
        error instanceof Error ? error.stack || error.message : String(error),
      );
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async exchangeCodeForTokens(code: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');

    const decodedCode = decodeURIComponent(code);

    const params = new URLSearchParams({
      code: decodedCode,
      client_id: clientId || '',
      client_secret: clientSecret || '',
      redirect_uri: redirectUri || '',
      grant_type: 'authorization_code',
    });

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://oauth2.googleapis.com/token',
          params.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'Failed to exchange code for tokens',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Failed to exchange authorization code for tokens',
      );
    }
  }

  async validateGoogleIdToken(idToken: string) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const client = new OAuth2Client(clientId);

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid ID token');

      return payload;
    } catch (error) {
      this.logger.error('Google ID token validation failed', error);
      throw new UnauthorizedException('Invalid Google ID token');
    }
  }
  getGoogleOAuthUrl() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
    const scope = encodeURIComponent('openid email profile');
    const baseUrl = this.configService.get<string>('GOOGLE_OAUTH_BASE_URL');
    const url = `${baseUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&access_type=offline&prompt=consent`;
    return { url };
  }

  async googleLogin(code: string) {
    const tokenResponse = await this.exchangeCodeForTokens(code);

    const payload = await this.validateGoogleIdToken(tokenResponse.id_token);

    let user = await this.usersService.findByGoogleId(payload.sub);
    if (!user) {
      user = await this.usersService.createFromGooglePayload({
        ...payload,
        scope: tokenResponse.scope?.split(' ') ?? [],
      });
    }

    const { accessToken, refreshToken } = this.generateJwtToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || payload.picture,
        provider: 'google',
      },
    };
  }

  generateJwtToken(user: User) {
    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '12h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}