import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(3600),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(
        service.register({
          email: 'test@example.com',
          phone: '+923001234567',
          name: 'Test User',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if phone already exists', async () => {
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce({ id: '1' }); // phone check

      await expect(
        service.register({
          email: 'test@example.com',
          phone: '+923001234567',
          name: 'Test User',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens on successful registration', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        phone: '+923001234567',
        name: 'Test User',
        role: 'CUSTOMER',
        createdAt: new Date(),
      };
      
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        phone: '+923001234567',
        name: 'Test User',
        password: 'Password123!',
      });

      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('CorrectPassword123!', 12),
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('Password123!', 12),
        isActive: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user and tokens on successful login', async () => {
      const password = 'Password123!';
      const passwordHash = await bcrypt.hash(password, 12);
      
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        phone: '+923001234567',
        name: 'Test User',
        role: 'CUSTOMER',
        passwordHash,
        isActive: true,
        createdAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@example.com',
        password,
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser('invalid-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        isActive: false,
      });

      await expect(service.validateUser('user-1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return user if found and active', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        phone: '+923001234567',
        name: 'Test User',
        role: 'CUSTOMER',
        isActive: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-1');
      expect(result).toEqual(mockUser);
    });
  });
});
