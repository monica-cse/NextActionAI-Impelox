import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { EmailService } from '../email/email.service';
import { OtpService } from '../otp/otp.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockEmailService = {
    sendPasswordResetEmail: jest.fn(),
  };

  const mockOtpService = {
    generateOtp: jest.fn(),
    verifyOtp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: OtpService,
          useValue: mockOtpService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', () => {
    const mockUserData = { email: 'test@example.com', password: 'pass' };
    mockUserModel.create.mockResolvedValue(mockUserData);

    const result = service.createUser(mockUserData);
    expect(result).toEqual(mockUserData);
    expect(mockUserModel.create).toHaveBeenCalledWith(mockUserData);
  });

  it('should generate OTP and send email', () => {
    const email = 'test@example.com';
    mockOtpService.generateOtp.mockResolvedValue('123456');

    service.sendOtp(email);

    expect(mockOtpService.generateOtp).toHaveBeenCalledWith(email);
    expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      email,
      '123456',
    );
  });

  it('should verify OTP', () => {
    const email = 'test@example.com';
    const otp = '123456';
    mockOtpService.verifyOtp.mockResolvedValue(true);

    const result = service.verifyOtp(email, otp);
    expect(result).toBe(true);
    expect(mockOtpService.verifyOtp).toHaveBeenCalledWith(email, otp);
  });

  it('should update user password', () => {
    const userId = 'user123';
    const newPassword = 'newPass';
    const mockResult = { acknowledged: true };

    mockUserModel.findByIdAndUpdate.mockResolvedValue(mockResult);

    const result = service.updatePassword(userId, newPassword);
    expect(result).toEqual(mockResult);
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      userId,
      { password: newPassword },
      { new: true },
    );
  });
});
