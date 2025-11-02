/**
 * Get the API base URL with trailing slash removed
 * This ensures no double slashes in API calls
 */
export function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  // Remove any trailing slashes to prevent double slashes in paths
  return apiUrl.replace(/\/+$/, '');
}

