import crypto from 'crypto';

export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getPinExpirationTime(): Date {
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 10);
  return expirationTime;
}

export function isPinExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function validatePhone(phone: string): boolean {
  // Basic validation: allows +, spaces, dashes, but must have digits
  // We'll strip non-digits/plus before checking length
  const clean = phone.replace(/[^\d+]/g, '');
  return clean.length >= 10 && clean.length <= 15;
}

export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters except leading +
  // This ensures consistent formatting: +2348084079411
  let sanitized = phone.trim();
  
  // Keep the leading + if present
  const hasPlus = sanitized.startsWith('+');
  
  // Remove all non-digits
  sanitized = sanitized.replace(/\D/g, '');
  
  // Add back the + if it was there
  if (hasPlus && !sanitized.startsWith('+')) {
    sanitized = '+' + sanitized;
  }
  
  return sanitized;
}
