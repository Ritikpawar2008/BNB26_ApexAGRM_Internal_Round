export const MAX_FILE_SIZE_MB = 100;
export const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.webm'];

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: 'Only MP4, MOV, and WebM videos are supported.' };
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `File exceeds maximum size of ${MAX_FILE_SIZE_MB}MB.` };
  }
  return { valid: true };
}
