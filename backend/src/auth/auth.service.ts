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
import { EmailService } from '../email/email.service';
import {
  welcomeEmailTemplate,
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  passwordChangedEmailTemplate,
} from '../email/templates/email-templates';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly saltRounds = 12;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
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

    // Send welcome email
    const frontendUrl = this.emailService.getFrontendUrl();
    const welcomeEmail = welcomeEmailTemplate({
      userName: user.name,
      frontendUrl,
    });

    await this.emailService.sendEmail({
      to: user.email,
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
      text: welcomeEmail.text,
    });

    // Send verification email
    const verificationToken = this.jwtService.sign(
      { sub: user.id, type: 'verify' },
      { expiresIn: '24h' }
    );

    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    const verificationEmail = verificationEmailTemplate({
      userName: user.name,
      frontendUrl,
      verificationUrl,
    });

    await this.emailService.sendEmail({
      to: user.email,
      subject: verificationEmail.subject,
      html: verificationEmail.html,
      text: verificationEmail.text,
    });

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
    if (user) {
      // Generate a reset token
      const resetToken = this.jwtService.sign(
        { sub: user.id, type: 'reset' },
        { expiresIn: '1h' }
      );

      // Send password reset email
      const frontendUrl = this.emailService.getFrontendUrl();
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
      
      const resetEmail = passwordResetEmailTemplate({
        userName: user.name,
        frontendUrl,
        resetUrl,
      });

      const emailResult = await this.emailService.sendEmail({
        to: user.email,
        subject: resetEmail.subject,
        html: resetEmail.html,
        text: resetEmail.text,
      });

      if (!emailResult.success) {
        this.logger.error(`Failed to send password reset email to ${user.email}: ${emailResult.error}`);
      }

      // Log token in development mode only (never in production)
      if (!this.emailService.isProd()) {
        this.logger.log(`[DEV] Password reset token for ${email}: ${resetToken}`);
      }
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

      // Get user details before updating
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Hash the new password
      const passwordHash = await bcrypt.hash(newPassword, this.saltRounds);

      // Update user's password
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash },
      });

      this.logger.log(`Password reset for user: ${payload.sub}`);

      // Send password changed confirmation email
      const frontendUrl = this.emailService.getFrontendUrl();
      const confirmationEmail = passwordChangedEmailTemplate({
        userName: user.name,
        frontendUrl,
      });

      await this.emailService.sendEmail({
        to: user.email,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
        text: confirmationEmail.text,
      });

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

    // Send verification email
    const frontendUrl = this.emailService.getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    const verificationEmail = verificationEmailTemplate({
      userName: user.name,
      frontendUrl,
      verificationUrl,
    });

    const emailResult = await this.emailService.sendEmail({
      to: user.email,
      subject: verificationEmail.subject,
      html: verificationEmail.html,
      text: verificationEmail.text,
    });

    if (!emailResult.success) {
      this.logger.error(`Failed to send verification email to ${user.email}: ${emailResult.error}`);
    }

    // Log token in development mode only (never in production)
    if (!this.emailService.isProd()) {
      this.logger.log(`[DEV] Email verification token for ${user.email}: ${verificationToken}`);
    }

    return { message: 'Verification email sent' };
  }
}
