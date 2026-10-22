import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * Email Module
 * 
 * Global module that provides the email service to the entire application.
 * Automatically selects the appropriate email provider based on configuration.
 */
@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
