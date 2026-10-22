/**
 * Password Strength Validator for KhaanaDa
 * 
 * Provides password strength checking and validation rules.
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */

export interface PasswordStrengthResult {
  score: number; // 0-4
  label: 'weak' | 'fair' | 'good' | 'strong';
  labelUrdu: 'کمزور' | 'ٹھیک' | 'اچھا' | 'مضبوط';
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
  isValid: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  let score: number;
  let label: PasswordStrengthResult['label'];
  let labelUrdu: PasswordStrengthResult['labelUrdu'];

  if (passedChecks <= 1) {
    score = 0;
    label = 'weak';
    labelUrdu = 'کمزور';
  } else if (passedChecks === 2) {
    score = 1;
    label = 'fair';
    labelUrdu = 'ٹھیک';
  } else if (passedChecks === 3 || passedChecks === 4) {
    score = 2;
    label = 'good';
    labelUrdu = 'اچھا';
  } else {
    score = 3;
    label = 'strong';
    labelUrdu = 'مضبوط';
  }

  return {
    score,
    label,
    labelUrdu,
    checks,
    isValid: passedChecks === 5,
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Pakistani phone format: +92XXXXXXXXXX or 0XXXXXXXXXX
  const phoneRegex = /^(\+92|0)?3[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

export function validateName(name: string): boolean {
  return name.trim().length >= 2;
}
