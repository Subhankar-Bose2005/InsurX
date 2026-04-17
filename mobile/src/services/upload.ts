import * as FileSystem from 'expo-file-system';
import { uploadFile } from './api';

/**
 * Reads a local image URI as base64 and uploads it to Firebase Storage via backend.
 * Returns the public URL, or null if upload fails (non-blocking).
 */
export async function uploadImage(
  localUri: string,
  filename: string,
): Promise<string | null> {
  try {
    const ext = localUri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const uniqueName = `${filename}_${Date.now()}.${ext}`;

    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const result = await uploadFile(base64, uniqueName, contentType);
    return result.url as string;
  } catch (err) {
    console.warn('[Upload] Failed to upload image:', err);
    return null;
  }
}
