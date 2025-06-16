import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let mockUser: any;

  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      otp: '123456',
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
    };

    const mockUsersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      updateUser: jest.fn(),
      updateByEmail: jest.fn(),
      resetPassword: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      signAsync: jest.fn(),
      verify: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(
      UsersService,
    ) as jest.Mocked<UsersService>;
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
  });

  describe('register', () => {
    it('should register a user and return tokens', async () => {
      // Mock implementations
      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign
        .mockReturnValueOnce('accessToken')
        .mockReturnValueOnce('refreshToken');

      const result = await service.register({
        name: 'John',
        email: mockUser.email,
        password: 'password123',
      });

      // Assertions
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockUser.email,
        }),
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        user: mockUser,
        token: 'accessToken',
        refreshToken: 'refreshToken',
      });
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      // Mock implementations
      usersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      usersService.updateByEmail.mockResolvedValue(mockUser);

      const result = await service.login({
        email: mockUser.email,
        password: 'password123',
      });

      // Assertions
      expect(result.token).toBe('accessToken');
      expect(result.refreshToken).toBe('refreshToken');
      expect(usersService.updateByEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.objectContaining({
          refreshToken: 'refreshToken',
        }),
      );
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.login({ email: 'wrong@mail.com', password: '123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      await expect(
        service.login({ email: mockUser.email, password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('sendOtp', () => {
    it('should generate and save OTP', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.updateUser.mockResolvedValue(mockUser);

      const result = await service.sendOtp(mockUser.email);

      expect(result.message).toBe('OTP sent to email');
      expect(usersService.updateUser).toHaveBeenCalledWith(
        mockUser.email,
        expect.objectContaining({
          otp: expect.any(String),
          otpExpiry: expect.any(Date),
        }),
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.sendOtp('nouser@mail.com')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyOtp', () => {
    it('should return reset token if OTP is valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('resetToken');

      const result = await service.verifyOtp({
        email: mockUser.email,
        otp: '123456',
      });

      expect(result).toEqual({ resetToken: 'resetToken' });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: mockUser.email, purpose: 'reset-password' },
        expect.anything(),
      );
    });

    it('should throw if OTP is expired', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        otpExpiry: new Date(Date.now() - 1000),
      });

      await expect(
        service.verifyOtp({ email: mockUser.email, otp: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if OTP is invalid', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...mockUser,
        otp: '000000',
      });

      await expect(
        service.verifyOtp({ email: mockUser.email, otp: '999999' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should send OTP for existing user', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.updateUser.mockResolvedValue(mockUser);

      const result = await service.forgotPassword({ email: mockUser.email });
      expect(result).toHaveProperty('message', 'OTP sent to email');
    });

    it('should throw if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(
        service.forgotPassword({ email: 'nouser@mail.com' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const mockToken = jwt.sign(
        { email: mockUser.email, purpose: 'reset-password' },
        'test-secret',
        { expiresIn: '15m' },
      );

      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.resetPassword.mockResolvedValue(mockUser);

      const result = await service.resetPassword(
        {
          email: mockUser.email,
          newPassword: 'newPass',
          confirmNewPassword: 'newPass',
        },
        `Bearer ${mockToken}`,
      );

      expect(result.message).toBe('Password reset successful');
    });

    it('should throw if passwords do not match', async () => {
      await expect(
        service.resetPassword(
          {
            email: mockUser.email,
            newPassword: 'one',
            confirmNewPassword: 'two',
          },
          'Bearer dummy',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.resetPassword(
          {
            email: mockUser.email,
            newPassword: 'pass',
            confirmNewPassword: 'pass',
          },
          'Bearer invalidtoken',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
