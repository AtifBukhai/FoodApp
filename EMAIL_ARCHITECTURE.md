# KhaanaDa Email System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        KhaanaDa Application                      │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Uses
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EmailModule (Global)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    EmailService                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Provider Selection Logic                           │  │  │
│  │  │  - Check NODE_ENV                                   │  │  │
│  │  │  - Check RESEND_API_KEY                             │  │  │
│  │  │  - Check EMAIL_ENABLED                              │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                ┌─────────────────┴─────────────────┐
                │                                   │
                ▼                                   ▼
    ┌───────────────────────┐         ┌───────────────────────┐
    │  ResendEmailService   │         │  ConsoleEmailService  │
    │  (Production Mode)    │         │  (Development Mode)   │
    ├───────────────────────┤         ├───────────────────────┤
    │ • Real email delivery │         │ • Logs to console     │
    │ • Resend API          │         │ • No external calls   │
    │ • Delivery tracking   │         │ • Token logging       │
    │ • Error handling      │         │ • Development only    │
    └───────────────────────┘         └───────────────────────┘
                │                                   │
                │                                   │
                ▼                                   ▼
    ┌───────────────────────┐         ┌───────────────────────┐
    │   Resend API Server   │         │   Backend Console     │
    │   (External Service)  │         │   (Terminal Output)   │
    └───────────────────────┘         └───────────────────────┘
```

## Email Flow Architecture

### Registration Flow
```
User Registration
       │
       ▼
┌──────────────────┐
│  AuthService     │
│  .register()     │
└──────────────────┘
       │
       ├─► Create User in Database
       │
       ├─► Generate JWT Tokens
       │
       ├─► Send Welcome Email ──────────► EmailService
       │                                        │
       │                                        ▼
       │                              ┌──────────────────┐
       │                              │ welcomeEmail     │
       │                              │ Template()       │
       │                              └──────────────────┘
       │                                        │
       │                                        ▼
       │                              ┌──────────────────┐
       │                              │ Provider.send()  │
       │                              └──────────────────┘
       │
       └─► Send Verification Email ───► EmailService
                                                │
                                                ▼
                                      ┌──────────────────┐
                                      │ verification     │
                                      │ EmailTemplate()  │
                                      └──────────────────┘
                                                │
                                                ▼
                                      ┌──────────────────┐
                                      │ Provider.send()  │
                                      └──────────────────┘
```

### Password Reset Flow
```
User Requests Reset
       │
       ▼
┌──────────────────┐
│  AuthService     │
│ .forgotPassword()│
└──────────────────┘
       │
       ├─► Find User by Email
       │
       ├─► Generate Reset Token (JWT, 1h expiry)
       │
       └─► Send Reset Email ────────────► EmailService
                                                │
                                                ▼
                                      ┌──────────────────┐
                                      │ passwordReset    │
                                      │ EmailTemplate()  │
                                      └──────────────────┘
                                                │
                                                ▼
                                      ┌──────────────────┐
                                      │ Provider.send()  │
                                      └──────────────────┘

User Clicks Reset Link
       │
       ▼
┌──────────────────┐
│  AuthService     │
│ .resetPassword() │
└──────────────────┘
       │
       ├─► Verify Token
       │
       ├─► Update Password
       │
       └─► Send Confirmation Email ───► EmailService
                                                │
                                                ▼
                                      ┌──────────────────┐
                                      │ passwordChanged  │
                                      │ EmailTemplate()  │
                                      └──────────────────┘
                                                │
                                                ▼
                                      ┌──────────────────┐
                                      │ Provider.send()  │
                                      └──────────────────┘
```

## Email Template Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Email Templates                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Welcome    │  │ Verification │  │ Password     │      │
│  │   Email      │  │    Email     │  │   Reset      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐                                           │
│  │  Password    │        All templates include:             │
│  │  Changed     │        • HTML version                     │
│  │    Email     │        • Plain text version               │
│  └──────────────┘        • KhaanaDa branding                │
│                          • Responsive design                │
│                          • Security messages                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Used by
                          ▼
              ┌───────────────────────┐
              │    EmailService       │
              │   .sendEmail()        │
              └───────────────────────┘
```

## Provider Selection Logic

```
START
  │
  ▼
┌─────────────────────────┐
│ Check NODE_ENV          │
└─────────────────────────┘
  │
  ├─► production ─────────────────────┐
  │                                   │
  │                                   ▼
  │                         ┌─────────────────┐
  │                         │ Has API Key?    │
  │                         └─────────────────┘
  │                                   │
  │                          ┌────────┴────────┐
  │                          │                 │
  │                         YES               NO
  │                          │                 │
  │                          ▼                 ▼
  │                ┌─────────────┐    ┌─────────────┐
  │                │ Use Resend  │    │ Use Console │
  │                │   Service   │    │   Service   │
  │                └─────────────┘    └─────────────┘
  │
  ├─► development ────────────────────┐
  │                                   │
  │                                   ▼
  │                         ┌─────────────────┐
  │                         │ EMAIL_ENABLED?  │
  │                         └─────────────────┘
  │                                   │
  │                          ┌────────┴────────┐
  │                          │                 │
  │                        true              false
  │                          │                 │
  │                          ▼                 ▼
  │                ┌─────────────────┐  ┌─────────────┐
  │                │ Has API Key?    │  │ Use Console │
  │                └─────────────────┘  │   Service   │
  │                          │          └─────────────┘
  │                 ┌────────┴────────┐
  │                 │                 │
  │                YES               NO
  │                 │                 │
  │                 ▼                 ▼
  │       ┌─────────────┐    ┌─────────────┐
  │       │ Use Resend  │    │ Use Console │
  │       │   Service   │    │   Service   │
  │       └─────────────┘    └─────────────┘
  │
  └─► test ─────────────────────────────┐
                                        │
                                        ▼
                              ┌─────────────┐
                              │ Use Console │
                              │   Service   │
                              └─────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Token Security                                          │
│     ┌─────────────────────────────────────────────────┐    │
│     │ • JWT tokens with expiration                    │    │
│     │ • Single-use tokens                             │    │
│     │ • Never logged in production                    │    │
│     │ • Logged only in development                    │    │
│     └─────────────────────────────────────────────────┘    │
│                                                              │
│  2. Email Enumeration Prevention                           │
│     ┌─────────────────────────────────────────────────┐    │
│     │ • Always return success                         │    │
│     │ • No indication of email existence              │    │
│     │ • Consistent response times                     │    │
│     └─────────────────────────────────────────────────┘    │
│                                                              │
│  3. Credential Protection                                  │
│     ┌─────────────────────────────────────────────────┐    │
│     │ • API keys in environment only                  │    │
│     │ • Never exposed in logs                         │    │
│     │ • Never exposed in responses                    │    │
│     │ • Validated at startup                          │    │
│     └─────────────────────────────────────────────────┘    │
│                                                              │
│  4. Content Safety                                         │
│     ┌─────────────────────────────────────────────────┐    │
│     │ • No sensitive data in emails                   │    │
│     │ • Safety messages included                      │    │
│     │ • Security recommendations                      │    │
│     │ • Professional tone                             │    │
│     └─────────────────────────────────────────────────┘    │
│                                                              │
│  5. Production Safeguards                                  │
│     ┌─────────────────────────────────────────────────┐    │
│     │ • Production mode detection                     │    │
│     │ • Token logging disabled                        │    │
│     │ • Configuration validation                      │    │
│     │ • Graceful degradation                          │    │
│     └─────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Email Sending Flow
```
AuthService
    │
    │ Calls
    ▼
EmailService.sendEmail(options)
    │
    ├─► Validate options
    │
    ├─► Select provider
    │   │
    │   ├─► Production + API key ──► ResendEmailService
    │   │
    │   └─► Otherwise ────────────► ConsoleEmailService
    │
    └─► Provider.sendEmail(options)
            │
            ├─► ResendEmailService
            │       │
            │       ├─► Format email
            │       ├─► Call Resend API
            │       ├─► Handle response
            │       └─► Return result
            │
            └─► ConsoleEmailService
                    │
                    ├─► Format output
                    ├─► Log to console
                    └─► Return result
```

### Template Generation Flow
```
AuthService
    │
    │ Needs email
    ▼
Import Template Function
    │
    │ Call with data
    ▼
┌─────────────────────────┐
│ Template Function       │
│                         │
│ • Accept data object    │
│ • Generate HTML         │
│ • Generate plain text   │
│ • Set subject           │
│ • Return {html, text,   │
│           subject}      │
└─────────────────────────┘
    │
    │ Return
    ▼
AuthService
    │
    │ Pass to
    ▼
EmailService.sendEmail()
```

## Configuration Flow

```
Application Start
       │
       ▼
┌──────────────────┐
│ Load .env file   │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Validate Config  │
│ (env.validation) │
└──────────────────┘
       │
       ├─► NODE_ENV
       ├─► RESEND_API_KEY
       ├─► EMAIL_FROM
       ├─► EMAIL_FROM_NAME
       ├─► FRONTEND_URL
       └─► EMAIL_ENABLED
       │
       ▼
┌──────────────────┐
│ EmailModule      │
│ Initialization   │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ EmailService     │
│ Constructor      │
└──────────────────┘
       │
       ├─► Check NODE_ENV
       ├─► Check RESEND_API_KEY
       ├─► Check EMAIL_ENABLED
       │
       ▼
┌──────────────────┐
│ Select Provider  │
└──────────────────┘
       │
       ├─► ResendEmailService
       │       │
       │       └─► Initialize Resend client
       │
       └─► ConsoleEmailService
               │
               └─► Ready to log
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                         AppModule                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Imports:                                                   │
│  ├─► ConfigModule (global)                                 │
│  ├─► ThrottlerModule                                       │
│  ├─► PrismaModule                                          │
│  ├─► EmailModule (global) ◄── NEW                          │
│  ├─► AuthModule                                            │
│  ├─► UsersModule                                           │
│  ├─► RestaurantsModule                                     │
│  ├─► OrdersModule                                          │
│  └─► AddressesModule                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       EmailModule                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  @Global()                                                   │
│                                                              │
│  Providers:                                                 │
│  └─► EmailService                                           │
│                                                              │
│  Exports:                                                   │
│  └─► EmailService (available to all modules)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        AuthModule                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Imports:                                                   │
│  ├─► PassportModule                                        │
│  └─► JwtModule                                             │
│                                                              │
│  Providers:                                                 │
│  ├─► AuthService (uses EmailService) ◄── MODIFIED          │
│  ├─► JwtStrategy                                           │
│  └─► LocalStrategy                                         │
│                                                              │
│  Controllers:                                               │
│  └─► AuthController                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Email Template Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Email Template                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  <!DOCTYPE html>                                            │
│  <html lang="en">                                          │
│  <head>                                                     │
│    ├─► <meta charset="UTF-8">                              │
│    ├─► <meta name="viewport" ...>                          │
│    └─► <style>                                             │
│         ├─► Base styles                                    │
│         ├─► Brand colors                                   │
│         ├─► Container styles                               │
│         ├─► Header styles                                  │
│         ├─► Content styles                                 │
│         ├─► Button styles                                  │
│         ├─► Footer styles                                  │
│         └─► Media queries (responsive)                     │
│         </style>                                            │
│  </head>                                                    │
│  <body>                                                     │
│    └─► <div class="container">                             │
│         ├─► <div class="header">                           │
│         │    ├─► Logo                                      │
│         │    └─► Tagline                                   │
│         │                                                   │
│         ├─► <div class="content">                          │
│         │    ├─► Heading                                   │
│         │    ├─► Personalized message                      │
│         │    ├─► Main content                              │
│         │    ├─► CTA button                                │
│         │    ├─► Safety message                            │
│         │    └─► Signature                                 │
│         │                                                   │
│         └─► <div class="footer">                           │
│              ├─► Copyright                                 │
│              └─► Context message                           │
│              </div>                                         │
│         </div>                                              │
│    </body>                                                   │
│  </html>                                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Testing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Suite                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Email Service Tests (11 tests)                             │
│  ├─► Development mode initialization                       │
│  ├─► Production mode initialization                        │
│  ├─► Console service fallback                              │
│  ├─► Email sending in different modes                      │
│  ├─► Configuration validation                              │
│  ├─► Frontend URL retrieval                                │
│  └─► Production mode detection                             │
│                                                              │
│  Email Template Tests (25+ tests)                          │
│  ├─► Welcome email generation                              │
│  │   ├─► Subject line correctness                          │
│  │   ├─► User data inclusion                               │
│  │   ├─► URL inclusion                                     │
│  │   ├─► Branding elements                                 │
│  │   └─► Plain text version                                │
│  │                                                          │
│  ├─► Verification email generation                         │
│  │   ├─► Subject line correctness                          │
│  │   ├─► Verification URL inclusion                        │
│  │   ├─► Expiration warning                                │
│  │   ├─► Safety message                                    │
│  │   └─► Plain text version                                │
│  │                                                          │
│  ├─► Password reset email generation                       │
│  │   ├─► Subject line correctness                          │
│  │   ├─► Reset URL inclusion                               │
│  │   ├─► Expiration warning                                │
│  │   ├─► Safety message                                    │
│  │   ├─► Security reminder                                 │
│  │   └─► Plain text version                                │
│  │                                                          │
│  ├─► Password changed email generation                     │
│  │   ├─► Subject line correctness                          │
│  │   ├─► User data inclusion                               │
│  │   ├─► Security warning                                  │
│  │   ├─► Recommendations                                   │
│  │   └─► Plain text version                                │
│  │                                                          │
│  └─► Template features                                     │
│      ├─► Responsive design                                 │
│      └─► Accessibility features                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Architecture Version:** 1.0  
**Last Updated:** 2024-01-16  
**Milestone:** 5 - Email Integration & Notifications
