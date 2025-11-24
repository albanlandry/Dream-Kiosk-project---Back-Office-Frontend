/**
 * Generate thumbnail URL for a resource using the thumbnail API
 * @param resourceId - The ID of the resource
 * @param resourceType - The type of resource ('video', 'animal', 'image')
 * @returns The thumbnail URL
 */
export function getThumbnailUrl(
  resourceId: string,
  resourceType: 'video' | 'animal' | 'image',
): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  return `${apiUrl}/resources/thumbnail?id=${resourceId}&type=${resourceType}`;
}

/**
 * Get thumbnail URL from a resource object
 * Falls back to direct URL if available, otherwise uses thumbnail API
 */
export function getResourceThumbnailUrl(
  resourceId: string,
  resourceType: 'video' | 'animal' | 'image',
  directUrl?: string | null,
): string | null {
  // If direct URL is provided and is a full URL, use it
  // if (directUrl && directUrl.startsWith('http')) {
  //   return directUrl;
  // }

  // // If direct URL is provided and is a relative path, construct full URL
  // if (directUrl && !directUrl.startsWith('http')) {
  //   const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
  //   return `${baseUrl}${directUrl.startsWith('/') ? directUrl : `/${directUrl}`}`;
  // }

  // Fallback to thumbnail API
  return getThumbnailUrl(resourceId, resourceType);
}

