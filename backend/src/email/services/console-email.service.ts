import { Injectable, Logger } from '@nestjs/common';
import { IEmailService, EmailOptions, EmailSendResult } from '../interfaces/email-service.interface';

/**
 * Console Email Service
 * 
 * Development/demo implementation that logs emails to console
 * instead of sending them. Used when no email provider is configured.
 */
@Injectable()
export class ConsoleEmailService implements IEmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    this.logger.log('═══════════════════════════════════════════════════════════');
    this.logger.log('📧 EMAIL (Console Mode - Not Actually Sent)');
    this.logger.log('═══════════════════════════════════════════════════════════');
    this.logger.log(`To: ${options.to}`);
    this.logger.log(`From: ${options.from || 'noreply@khaanada.pk'}`);
    this.logger.log(`Subject: ${options.subject}`);
    this.logger.log('───────────────────────────────────────────────────────────');
    
    // Log plain text version if available
    if (options.text) {
      this.logger.log('Plain Text:');
      this.logger.log(options.text);
    }
    
    this.logger.log('───────────────────────────────────────────────────────────');
    this.logger.log('HTML Preview (first 500 chars):');
    this.logger.log(options.html.substring(0, 500) + (options.html.length > 500 ? '...' : ''));
    this.logger.log('═══════════════════════════════════════════════════════════');

    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }

  isConfigured(): boolean {
    return true; // Console service is always "configured"
  }
}
