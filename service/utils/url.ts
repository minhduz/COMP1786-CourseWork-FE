export const getAvatarUrl = (avatarPath: string | null | undefined): string | null => {
  if (!avatarPath) return null;
  
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
  
  // If avatar path already starts with http, return as is
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const path = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;
  
  return `${baseUrl}/${path}`;
};