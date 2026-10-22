import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 12;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if email exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check if phone exists
    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (existingPhone) {
      throw new ConflictException('Phone number already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        name: dto.name,
        passwordHash,
        role: UserRole.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.role);

    this.logger.log(`User registered: ${user.email}`);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.role);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  private async generateTokens(userId: string, role: UserRole) {
    const payload = { sub: userId, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<number>('JWT_EXPIRATION', 3600),
    });

    // For refresh token, use longer expiration
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // In production, this would send an email with a reset token
    if (user) {
      // Generate a reset token (in production, store this in database with expiration)
      const resetToken = this.jwtService.sign(
        { sub: user.id, type: 'reset' },
        { expiresIn: '1h' }
      );

      this.logger.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
      // In production: send email with reset link containing this token
    }

    return {
      message: 'If an account exists with that email, reset instructions have been sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify the reset token
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      // Hash the new password
      const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);

      // Update user's password
      await this.prisma.user.update({
        where: { id: payload.sub },
         { passwordHash },
      });

      this.logger.log(`Password reset for user: ${payload.sub}`);

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Reset token has expired');
      }
      throw new UnauthorizedException('Invalid reset token');
    }
  }

  async verifyEmail(token: string) {
    try {
      // Verify the verification token
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'verify') {
        throw new UnauthorizedException('Invalid verification token');
      }

      // Mark email as verified
      await this.prisma.user.update({
        where: { id: payload.sub },
         { emailVerified: true },
      });

      this.logger.log(`Email verified for user: ${payload.sub}`);

      return { message: 'Email verified successfully' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Verification token has expired');
      }
      throw new UnauthorizedException('Invalid verification token');
    }
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.emailVerified) {
      return { message: 'Email already verified' };
    }

    // Generate verification token
    const verificationToken = this.jwtService.sign(
      { sub: user.id, type: 'verify' },
      { expiresIn: '24h' }
    );

    this.logger.log(`[DEV] Email verification token for ${user.email}: ${verificationToken}`);
    // In production: send email with verification link containing this token

    return { message: 'Verification email sent' };
  }
}
