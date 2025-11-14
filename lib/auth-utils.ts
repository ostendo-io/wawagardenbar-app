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
