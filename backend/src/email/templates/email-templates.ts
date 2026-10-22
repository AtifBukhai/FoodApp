/**
 * Email Templates for KhaanaDa
 * 
 * Reusable HTML email templates with KhaanaDa branding.
 * All templates are responsive and mobile-friendly.
 */

const BRAND_COLORS = {
  orange: '#F97316',
  orangeDark: '#EA580C',
  green: '#166534',
  greenDark: '#14532D',
  cream: '#FFF8F0',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
};

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1F2937;
    background-color: ${BRAND_COLORS.cream};
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #FFFFFF;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .header {
    background: linear-gradient(135deg, ${BRAND_COLORS.orange}, ${BRAND_COLORS.orangeDark});
    padding: 32px 24px;
    text-align: center;
  }
  .logo {
    font-size: 32px;
    font-weight: bold;
    color: #FFFFFF;
    margin: 0;
  }
  .tagline {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-top: 4px;
  }
  .content {
    padding: 32px 24px;
  }
  .button {
    display: inline-block;
    background-color: ${BRAND_COLORS.orange};
    color: #FFFFFF;
    padding: 12px 32px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin: 16px 0;
  }
  .button:hover {
    background-color: ${BRAND_COLORS.orangeDark};
  }
  .footer {
    background-color: ${BRAND_COLORS.grayLight};
    padding: 24px;
    text-align: center;
    font-size: 12px;
    color: ${BRAND_COLORS.gray};
  }
  .warning {
    background-color: #FEF3C7;
    border-left: 4px solid #F59E0B;
    padding: 12px 16px;
    margin: 16px 0;
    font-size: 14px;
  }
  h1 {
    color: ${BRAND_COLORS.green};
    font-size: 24px;
    margin-top: 0;
  }
  p {
    margin: 16px 0;
  }
  .link {
    color: ${BRAND_COLORS.orange};
    word-break: break-all;
    font-size: 14px;
    background-color: ${BRAND_COLORS.grayLight};
    padding: 8px 12px;
    border-radius: 4px;
    display: block;
    margin: 12px 0;
  }
  @media only screen and (max-width: 600px) {
    .container {
      width: 100% !important;
      border-radius: 0 !important;
    }
    .content {
      padding: 24px 16px !important;
    }
  }
`;

export interface EmailTemplateData {
  userName: string;
  frontendUrl: string;
}

export interface VerificationEmailData extends EmailTemplateData {
  verificationUrl: string;
}

export interface PasswordResetEmailData extends EmailTemplateData {
  resetUrl: string;
}

/**
 * Welcome Email Template
 */
export function welcomeEmailTemplate(data: EmailTemplateData): { html: string; text: string; subject: string } {
  const subject = 'Welcome to KhaanaDa — Cravings Delivered!';
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to KhaanaDa</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">🍽️ KhaanaDa</h1>
      <p class="tagline">Cravings Delivered</p>
    </div>
    <div class="content">
      <h1>Welcome, ${data.userName}!</h1>
      <p>Thank you for joining KhaanaDa — Pakistan's favorite food delivery platform!</p>
      <p>We're excited to help you discover amazing restaurants and get delicious food delivered to your doorstep.</p>
      <p style="text-align: center;">
        <a href="${data.frontendUrl}" class="button">Start Ordering</a>
      </p>
      <p>Here's what you can do:</p>
      <ul>
        <li>Browse hundreds of restaurants</li>
        <li>Order your favorite dishes</li>
        <li>Track your orders in real-time</li>
        <li>Save your favorite addresses</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Happy ordering!<br>The KhaanaDa Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 KhaanaDa. All rights reserved.</p>
      <p>This email was sent to ${data.userName} because you created an account on KhaanaDa.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Welcome to KhaanaDa, ${data.userName}!

Thank you for joining KhaanaDa — Pakistan's favorite food delivery platform!

We're excited to help you discover amazing restaurants and get delicious food delivered to your doorstep.

Start ordering now: ${data.frontendUrl}

Here's what you can do:
- Browse hundreds of restaurants
- Order your favorite dishes
- Track your orders in real-time
- Save your favorite addresses

If you have any questions, feel free to reach out to our support team.

Happy ordering!
The KhaanaDa Team

---
© 2024 KhaanaDa. All rights reserved.
This email was sent to ${data.userName} because you created an account on KhaanaDa.
  `.trim();

  return { html, text, subject };
}

/**
 * Email Verification Template
 */
export function verificationEmailTemplate(data: VerificationEmailData): { html: string; text: string; subject: string } {
  const subject = 'Verify Your Email Address — KhaanaDa';
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">🍽️ KhaanaDa</h1>
      <p class="tagline">Cravings Delivered</p>
    </div>
    <div class="content">
      <h1>Verify Your Email Address</h1>
      <p>Hi ${data.userName},</p>
      <p>Welcome to KhaanaDa! Please verify your email address to complete your registration and start ordering delicious food.</p>
      <p style="text-align: center;">
        <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p class="link">${data.verificationUrl}</p>
      <div class="warning">
        <strong>⚠️ This link will expire in 24 hours.</strong>
      </div>
      <p>If you didn't create an account with KhaanaDa, you can safely ignore this email.</p>
      <p>Thanks,<br>The KhaanaDa Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 KhaanaDa. All rights reserved.</p>
      <p>This email was sent to verify your email address for KhaanaDa.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Verify Your Email Address — KhaanaDa

Hi ${data.userName},

Welcome to KhaanaDa! Please verify your email address to complete your registration and start ordering delicious food.

Verify your email by clicking this link:
${data.verificationUrl}

⚠️ This link will expire in 24 hours.

If you didn't create an account with KhaanaDa, you can safely ignore this email.

Thanks,
The KhaanaDa Team

---
© 2024 KhaanaDa. All rights reserved.
This email was sent to verify your email address for KhaanaDa.
  `.trim();

  return { html, text, subject };
}

/**
 * Password Reset Template
 */
export function passwordResetEmailTemplate(data: PasswordResetEmailData): { html: string; text: string; subject: string } {
  const subject = 'Reset Your Password — KhaanaDa';
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">🍽️ KhaanaDa</h1>
      <p class="tagline">Cravings Delivered</p>
    </div>
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>Hi ${data.userName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p style="text-align: center;">
        <a href="${data.resetUrl}" class="button">Reset Password</a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p class="link">${data.resetUrl}</p>
      <div class="warning">
        <strong>⚠️ This link will expire in 1 hour.</strong>
      </div>
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      <p>For security, please don't share this link with anyone.</p>
      <p>Thanks,<br>The KhaanaDa Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 KhaanaDa. All rights reserved.</p>
      <p>This email was sent because a password reset was requested for your KhaanaDa account.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Reset Your Password — KhaanaDa

Hi ${data.userName},

We received a request to reset your password. Click the link below to create a new password:

${data.resetUrl}

⚠️ This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

For security, please don't share this link with anyone.

Thanks,
The KhaanaDa Team

---
© 2024 KhaanaDa. All rights reserved.
This email was sent because a password reset was requested for your KhaanaDa account.
  `.trim();

  return { html, text, subject };
}

/**
 * Password Changed Confirmation Template
 */
export function passwordChangedEmailTemplate(data: EmailTemplateData): { html: string; text: string; subject: string } {
  const subject = 'Your Password Has Been Changed — KhaanaDa';
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">🍽️ KhaanaDa</h1>
      <p class="tagline">Cravings Delivered</p>
    </div>
    <div class="content">
      <h1>Password Changed Successfully</h1>
      <p>Hi ${data.userName},</p>
      <p>This is a confirmation that your password has been successfully changed.</p>
      <p>If you made this change, you can continue using KhaanaDa with your new password.</p>
      <p style="text-align: center;">
        <a href="${data.frontendUrl}" class="button">Continue to KhaanaDa</a>
      </p>
      <div class="warning">
        <strong>🔒 Didn't make this change?</strong><br>
        If you didn't change your password, your account may be compromised. Please contact our support team immediately.
      </div>
      <p>For your security, we recommend:</p>
      <ul>
        <li>Using a strong, unique password</li>
        <li>Not sharing your password with anyone</li>
        <li>Logging out when using shared devices</li>
      </ul>
      <p>Thanks,<br>The KhaanaDa Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 KhaanaDa. All rights reserved.</p>
      <p>This email was sent to confirm a password change on your KhaanaDa account.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Your Password Has Been Changed — KhaanaDa

Hi ${data.userName},

This is a confirmation that your password has been successfully changed.

If you made this change, you can continue using KhaanaDa with your new password.

Continue to KhaanaDa: ${data.frontendUrl}

🔒 Didn't make this change?
If you didn't change your password, your account may be compromised. Please contact our support team immediately.

For your security, we recommend:
- Using a strong, unique password
- Not sharing your password with anyone
- Logging out when using shared devices

Thanks,
The KhaanaDa Team

---
© 2024 KhaanaDa. All rights reserved.
This email was sent to confirm a password change on your KhaanaDa account.
  `.trim();

  return { html, text, subject };
}
