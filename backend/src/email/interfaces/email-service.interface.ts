/**
 * Email Service Interface
 * 
 * Abstraction layer for email providers. Allows switching between
 * different providers (Resend, SendGrid, AWS SES, etc.) without
 * modifying authentication logic.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<EmailSendResult>;
  isConfigured(): boolean;
}
