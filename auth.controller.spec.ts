import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

describe('AuthController', () => {
  let authController: AuthController;
  // let authService: AuthService;

  const mockAuthService = {
    register: jest
      .fn()
      .mockResolvedValue({ message: 'User registered successfully' }),
    login: jest.fn().mockResolvedValue({ accessToken: 'mock-token' }),
    resetPassword: jest
      .fn()
      .mockResolvedValue({ message: 'Password reset successful' }),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    // authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      };

      const result = await authController.register(dto);
      expect(result).toEqual({ message: 'User registered successfully' });
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const dto: LoginUserDto = {
        email: 'john@example.com',
        password: 'Password123',
      };

      const result = await authController.login(dto);
      expect(result).toEqual({ accessToken: 'mock-token' });
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const dto: ResetPasswordDto = {
        email: 'user@example.com',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123',
      };

      const authHeader = 'Bearer some-jwt-token';
      const result = await authController.resetPassword(dto, authHeader);

      expect(result).toEqual({ message: 'Password reset successful' });
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        dto,
        authHeader,
      );
    });
  });
});
