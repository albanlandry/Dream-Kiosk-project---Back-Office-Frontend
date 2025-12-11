/**
 * Sanitization utilities for form inputs
 */

export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');
};

export const sanitizeEmail = (email: string): string => {
  return sanitizeString(email).toLowerCase().trim();
};
