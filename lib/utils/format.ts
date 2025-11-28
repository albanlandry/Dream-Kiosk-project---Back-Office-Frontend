/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Mask user ID for security - shows first 8 and last 4 characters
 * Example: "db8f68e3-c7be-4fd8-b1cd-4d0c5b646651" -> "db8f68e3...4651"
 */
export function maskUserId(userId: string): string {
  if (!userId || userId.length <= 12) {
    return userId;
  }
  
  // For UUIDs or long IDs, show first 8 and last 4 characters
  const start = userId.substring(0, 8);
  const end = userId.substring(userId.length - 4);
  return `${start}...${end}`;
}

