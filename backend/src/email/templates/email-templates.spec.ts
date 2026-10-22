import {
  welcomeEmailTemplate,
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  passwordChangedEmailTemplate,
} from './email-templates';

describe('Email Templates', () => {
  const baseData = {
    userName: 'Ahmed Khan',
    frontendUrl: 'https://khaanada.pk',
  };

  describe('welcomeEmailTemplate', () => {
    it('should generate welcome email with correct subject', () => {
      const result = welcomeEmailTemplate(baseData);
      expect(result.subject).toContain('Welcome');
      expect(result.subject).toContain('KhaanaDa');
    });

    it('should include user name in HTML', () => {
      const result = welcomeEmailTemplate(baseData);
      expect(result.html).toContain('Ahmed Khan');
    });

    it('should include frontend URL in HTML', () => {
      const result = welcomeEmailTemplate(baseData);
      expect(result.html).toContain('https://khaanada.pk');
    });

    it('should include KhaanaDa branding', () => {
      const result = welcomeEmailTemplate(baseData);
      expect(result.html).toContain('KhaanaDa');
      expect(result.html).toContain('Cravings Delivered');
    });

    it('should generate plain text version', () => {
      const result = welcomeEmailTemplate(baseData);
      expect(result.text).toBeDefined();
      expect(result.text).toContain('Ahmed Khan');
      expect(result.text).toContain('https://khaanada.pk');
    });

    it('should include brand colors', () => {
      const result = welcomeEmailTemplate(baseData);
      expect(result.html).toContain('#F97316'); // Orange
      expect(result.html).toContain('#166534'); // Green
    });
  });

  describe('verificationEmailTemplate', () => {
    const verificationData = {
      ...baseData,
      verificationUrl: 'https://khaanada.pk/verify-email?token=abc123',
    };

    it('should generate verification email with correct subject', () => {
      const result = verificationEmailTemplate(verificationData);
      expect(result.subject).toContain('Verify');
      expect(result.subject).toContain('Email');
    });

    it('should include verification URL in HTML', () => {
      const result = verificationEmailTemplate(verificationData);
      expect(result.html).toContain('https://khaanada.pk/verify-email?token=abc123');
    });

    it('should include expiration warning', () => {
      const result = verificationEmailTemplate(verificationData);
      expect(result.html).toContain('24 hours');
    });

    it('should include safety message for unintended requests', () => {
      const result = verificationEmailTemplate(verificationData);
      expect(result.html).toContain('didn\'t create an account');
      expect(result.html).toContain('safely ignore');
    });

    it('should generate plain text version with verification URL', () => {
      const result = verificationEmailTemplate(verificationData);
      expect(result.text).toContain('https://khaanada.pk/verify-email?token=abc123');
    });
  });

  describe('passwordResetEmailTemplate', () => {
    const resetData = {
      ...baseData,
      resetUrl: 'https://khaanada.pk/reset-password?token=xyz789',
    };

    it('should generate password reset email with correct subject', () => {
      const result = passwordResetEmailTemplate(resetData);
      expect(result.subject).toContain('Reset');
      expect(result.subject).toContain('Password');
    });

    it('should include reset URL in HTML', () => {
      const result = passwordResetEmailTemplate(resetData);
      expect(result.html).toContain('https://khaanada.pk/reset-password?token=xyz789');
    });

    it('should include expiration warning', () => {
      const result = passwordResetEmailTemplate(resetData);
      expect(result.html).toContain('1 hour');
    });

    it('should include safety message for unintended requests', () => {
      const result = passwordResetEmailTemplate(resetData);
      expect(result.html).toContain('didn\'t request a password reset');
      expect(result.html).toContain('safely ignore');
    });

    it('should include security reminder', () => {
      const result = passwordResetEmailTemplate(resetData);
      expect(result.html).toContain('don\'t share this link');
    });

    it('should generate plain text version with reset URL', () => {
      const result = passwordResetEmailTemplate(resetData);
      expect(result.text).toContain('https://khaanada.pk/reset-password?token=xyz789');
    });
  });

  describe('passwordChangedEmailTemplate', () => {
    it('should generate password changed email with correct subject', () => {
      const result = passwordChangedEmailTemplate(baseData);
      expect(result.subject).toContain('Password');
      expect(result.subject).toContain('Changed');
    });

    it('should include user name in HTML', () => {
      const result = passwordChangedEmailTemplate(baseData);
      expect(result.html).toContain('Ahmed Khan');
    });

    it('should include frontend URL', () => {
      const result = passwordChangedEmailTemplate(baseData);
      expect(result.html).toContain('https://khaanada.pk');
    });

    it('should include security warning for unauthorized changes', () => {
      const result = passwordChangedEmailTemplate(baseData);
      expect(result.html).toContain('Didn\'t make this change');
      expect(result.html).toContain('account may be compromised');
    });

    it('should include security recommendations', () => {
      const result = passwordChangedEmailTemplate(baseData);
      expect(result.html).toContain('strong, unique password');
      expect(result.html).toContain('Not sharing your password');
    });

    it('should generate plain text version', () => {
      const result = passwordChangedEmailTemplate(baseData);
      expect(result.text).toBeDefined();
      expect(result.text).toContain('Ahmed Khan');
    });
  });

  describe('Template responsiveness', () => {
    it('should include mobile-friendly media queries', () => {
      const result = welcomeEmailTemplate(baseData);
      expect(result.html).toContain('@media');
      expect(result.html).toContain('max-width: 600px');
    });

    it('should include viewport meta tag', () => {
      const result = welcomeEmailTemplate(baseData);
      expect(result.html).toContain('viewport');
      expect(result.html).toContain('width=device-width');
    });
  });

  describe('Template accessibility', () => {
    it('should include proper HTML structure', () => {
      const result = welcomeEmailTemplate(baseData);
      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<html');
      expect(result.html).toContain('<head>');
      expect(result.html).toContain('<body>');
    });

    it('should include language attribute', () => {
      const result = welcomeEmailTemplate(baseData);
      expect(result.html).toContain('lang="en"');
    });
  });
});
