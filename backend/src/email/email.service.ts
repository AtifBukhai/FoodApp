import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailService, EmailOptions, EmailSendResult } from './interfaces/email-service.interface';
import { ResendEmailService } from './services/resend-email.service';
import { ConsoleEmailService } from './services/console-email.service';

/**
 * Email Service
 * 
 * Main email service that delegates to the appropriate provider
 * based on configuration. Uses Resend in production and Console
 * in development/demo mode.
 */
@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly provider: IEmailService;
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const emailEnabled = this.configService.get<string>('EMAIL_ENABLED', 'false') === 'true';
    const hasApiKey = !!this.configService.get<string>('RESEND_API_KEY');

    // Use Resend if in production with API key, or if explicitly enabled with API key
    if ((this.isProduction || emailEnabled) && hasApiKey) {
      this.provider = new ResendEmailService(configService);
      this.logger.log('Email service initialized with Resend provider');
    } else {
      this.provider = new ConsoleEmailService();
      if (this.isProduction && !hasApiKey) {
        this.logger.warn('Production mode but no RESEND_API_KEY configured. Using console email service.');
      } else {
        this.logger.log('Email service initialized with console provider (demo mode)');
      }
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    return this.provider.sendEmail(options);
  }

  isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  /**
   * Get the frontend URL for generating email links
   */
  getFrontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  }

  /**
   * Check if running in production mode
   */
  isProd(): boolean {
    return this.isProduction;
  }
}
