import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { IEmailService, EmailOptions, EmailSendResult } from '../interfaces/email-service.interface';

/**
 * Resend Email Service
 * 
 * Production implementation using Resend email provider.
 * Requires RESEND_API_KEY environment variable.
 */
@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required for ResendEmailService');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@khaanada.pk');
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME', 'KhaanaDa');
  }

  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    try {
      const from = options.from || `${this.fromName} <${this.fromEmail}>`;

      const { data, error } = await this.resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
        return {
          success: false,
          error: error.message,
        };
      }

      this.logger.log(`Email sent successfully to ${options.to} (ID: ${data?.id})`);

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email to ${options.to}: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  isConfigured(): boolean {
    return !!this.configService.get<string>('RESEND_API_KEY');
  }
}
