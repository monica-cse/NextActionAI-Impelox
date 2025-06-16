import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { OtpService } from '../otp/otp.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    sendPasswordResetOtp: jest.fn(),
    verifyPasswordResetOtp: jest.fn(),
  };

  const mockOtpService = {
    generateOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should send OTP to user email', async () => {
    const emailDto = { email: 'test@example.com' };
    mockUsersService.sendPasswordResetOtp.mockResolvedValue({
      message: 'OTP sent',
    });

    const result = await controller.sendResetOtp(emailDto);

    expect(result).toEqual({ message: 'OTP sent' });
    expect(mockUsersService.sendPasswordResetOtp).toHaveBeenCalledWith(
      emailDto.email,
    );
  });

  it('should verify OTP successfully', async () => {
    const verifyDto = { email: 'test@example.com', otp: '123456' };
    mockUsersService.verifyPasswordResetOtp.mockResolvedValue({
      success: true,
    });

    const result = await controller.verifyResetOtp(verifyDto);

    expect(result).toEqual({ success: true });
    expect(mockUsersService.verifyPasswordResetOtp).toHaveBeenCalledWith(
      verifyDto.email,
      verifyDto.otp,
    );
  });

  it('should fail OTP verification', async () => {
    const verifyDto = { email: 'test@example.com', otp: '000000' };
    mockUsersService.verifyPasswordResetOtp.mockResolvedValue({
      success: false,
    });

    const result = await controller.verifyResetOtp(verifyDto);

    expect(result).toEqual({ success: false });
    expect(mockUsersService.verifyPasswordResetOtp).toHaveBeenCalledWith(
      verifyDto.email,
      verifyDto.otp,
    );
  });
});
