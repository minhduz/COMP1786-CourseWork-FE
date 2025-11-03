import { File } from 'expo-file-system';

/**
 * Using the legacy API (most reliable for Expo SDK 54)
 * Import from 'expo-file-system/legacy'
 */
import * as FileSystemLegacy from 'expo-file-system/legacy';

/**
 * Converts a local file URI to a format suitable for multipart/form-data upload
 * Uses the new Expo FileSystem API (v54+)
 * Works on both iOS and Android
 */
export const normalizeFileForUpload = async (uri: string, filename?: string) => {
  try {
    // Use the new File API
    const file = new File(uri);
    
    // Check if file exists using the exists property (not a method)
    if (!file.exists) {
      console.warn(`File does not exist: ${uri}`);
      return null;
    }

    // Get file size using the size property
    const fileSize = file.size;
    
    // Extract filename from URI if not provided
    const finalFilename = filename || uri.split('/').pop() || `file_${Date.now()}`;
    
    // Determine MIME type based on file extension
    const extension = finalFilename.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';
    
    if (extension) {
      const mimeTypes: Record<string, string> = {
        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'bmp': 'image/bmp',
        'svg': 'image/svg+xml',
        'heic': 'image/heic',
        'heif': 'image/heif',
        
        // Documents
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'csv': 'text/csv',
      };
      
      mimeType = mimeTypes[extension] || mimeType;
    }

    // Read file as base64
    const base64Content = await file.base64();

    // Return in a format compatible with FormData
    return {
      uri: `data:${mimeType};base64,${base64Content}`,
      type: mimeType,
      name: finalFilename,
      size: fileSize,
    };
  } catch (error) {
    console.error(`Failed to normalize file ${uri}:`, error);
    return null;
  }
};

/**
 * Alternative: Direct URI approach for FormData
 * This is simpler and works well with most upload libraries
 * Recommended for most use cases
 */
export const normalizeFileForUploadDirect = async (
  uri: string, 
  filename?: string
) => {
  try {
    const file = new File(uri);
    
    if (!file.exists) {
      console.warn(`File does not exist: ${uri}`);
      return null;
    }

    const finalFilename = filename || uri.split('/').pop() || `file_${Date.now()}`;
    
    // Determine MIME type
    const extension = finalFilename.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';
    
    if (extension) {
      const imageMimes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'heic': 'image/heic',
      };
      mimeType = imageMimes[extension] || mimeType;
    }

    // Return object that works with FormData
    // Many libraries accept the URI directly
    return {
      uri: uri,
      type: mimeType,
      name: finalFilename,
      size: file.size,
    };
  } catch (error) {
    console.error(`Failed to normalize file ${uri}:`, error);
    return null;
  }
};

/**
 * Using fetch API (works well in most cases)
 * Best for web compatibility
 */
export const normalizeFileForUploadWithFetch = async (
  uri: string, 
  filename?: string
) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const finalFilename = filename || uri.split('/').pop() || `file_${Date.now()}`;
    
    return {
      uri: uri,
      type: blob.type || 'application/octet-stream',
      name: finalFilename,
      size: blob.size,
    };
  } catch (error) {
    console.error(`Failed to normalize file with fetch ${uri}:`, error);
    return null;
  }
};

/**
 * Simple approach: Just format the file object for FormData
 * No File API checks - fastest for known-good URIs
 */
export const normalizeFileForUploadSimple = (
  uri: string,
  filename?: string
) => {
  const finalFilename = filename || uri.split('/').pop() || `file_${Date.now()}`;
  const extension = finalFilename.split('.').pop()?.toLowerCase();
  
  let mimeType = 'application/octet-stream';
  if (extension === 'jpg' || extension === 'jpeg') {
    mimeType = 'image/jpeg';
  } else if (extension === 'png') {
    mimeType = 'image/png';
  } else if (extension === 'gif') {
    mimeType = 'image/gif';
  } else if (extension === 'webp') {
    mimeType = 'image/webp';
  }
  
  return {
    uri: uri,
    type: mimeType,
    name: finalFilename,
  };
};

/**
 * Batch normalize multiple files
 * Filters out any failed conversions
 */
export const normalizeFilesForUpload = async (
  uris: string[], 
  filenames?: string[]
): Promise<{ uri: string; type: string; name: string; size?: number }[]> => {
  const normalized = await Promise.all(
    uris.map((uri, index) => 
      normalizeFileForUploadDirect(uri, filenames?.[index])
    )
  );
  
  // Filter out null values (failed conversions)
  return normalized.filter((file): file is NonNullable<typeof file> => file !== null);
};

export const normalizeFileForUploadLegacy = async (uri: string, filename?: string) => {
  try {
    const fileInfo = await FileSystemLegacy.getInfoAsync(uri);
    
    if (!fileInfo.exists) {
      console.warn(`File does not exist: ${uri}`);
      return null;
    }

    const finalFilename = filename || uri.split('/').pop() || `file_${Date.now()}`;
    
    // Determine MIME type
    const extension = finalFilename.split('.').pop()?.toLowerCase();
    let mimeType = 'application/octet-stream';
    
    if (extension) {
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'heic': 'image/heic',
        'pdf': 'application/pdf',
      };
      mimeType = mimeTypes[extension] || mimeType;
    }

    // Read file as base64
    const base64Content = await FileSystemLegacy.readAsStringAsync(uri, {
      encoding: FileSystemLegacy.EncodingType.Base64,
    });

    return {
      uri: `data:${mimeType};base64,${base64Content}`,
      type: mimeType,
      name: finalFilename,
      size: fileInfo.size,
    };
  } catch (error) {
    console.error(`Failed to normalize file ${uri}:`, error);
    return null;
  }
};