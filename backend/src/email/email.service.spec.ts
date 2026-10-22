import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { ResendEmailService } from './services/resend-email.service';
import { ConsoleEmailService } from './services/console-email.service';

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  describe('Development mode (no API key)', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string, defaultValue?: any) => {
                const config = {
                  NODE_ENV: 'development',
                  RESEND_API_KEY: undefined,
                  EMAIL_FROM: 'test@khaanada.pk',
                  EMAIL_FROM_NAME: 'KhaanaDa Test',
                  FRONTEND_URL: 'http://localhost:5173',
                  EMAIL_ENABLED: 'false',
                };
                return config[key] || defaultValue;
              },
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
      configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should use console email service in development without API key', () => {
      expect(service.isConfigured()).toBe(true);
      expect(service.isProd()).toBe(false);
    });

    it('should send email using console service', async () => {
      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test</p>',
        text: 'Test',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.messageId).toContain('console-');
    });

    it('should return frontend URL', () => {
      expect(service.getFrontendUrl()).toBe('http://localhost:5173');
    });
  });

  describe('Production mode with API key', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string, defaultValue?: any) => {
                const config = {
                  NODE_ENV: 'production',
                  RESEND_API_KEY: 're_test_key_123',
                  EMAIL_FROM: 'noreply@khaanada.pk',
                  EMAIL_FROM_NAME: 'KhaanaDa',
                  FRONTEND_URL: 'https://khaanada.pk',
                  EMAIL_ENABLED: 'true',
                };
                return config[key] || defaultValue;
              },
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
      configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should be in production mode', () => {
      expect(service.isProd()).toBe(true);
    });

    it('should be configured', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should return production frontend URL', () => {
      expect(service.getFrontendUrl()).toBe('https://khaanada.pk');
    });
  });

  describe('Email explicitly enabled without API key', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string, defaultValue?: any) => {
                const config = {
                  NODE_ENV: 'development',
                  RESEND_API_KEY: undefined,
                  EMAIL_FROM: 'test@khaanada.pk',
                  EMAIL_FROM_NAME: 'KhaanaDa Test',
                  FRONTEND_URL: 'http://localhost:5173',
                  EMAIL_ENABLED: 'true',
                };
                return config[key] || defaultValue;
              },
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
    });

    it('should fall back to console service when no API key even if enabled', () => {
      expect(service.isConfigured()).toBe(true);
    });
  });
});
