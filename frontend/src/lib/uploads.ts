export const BOOKING_ALLOWED_MIMES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_BOOKING_FILE_BYTES = 10 * 1024 * 1024;

export function validateBookingFiles(files: FileList | null): string | null {
  if (!files?.length) return null;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (f.size > MAX_BOOKING_FILE_BYTES) {
      return `${f.name} exceeds max size`;
    }
    if (!BOOKING_ALLOWED_MIMES.includes(f.type)) {
      return `${f.name} has unsupported type`;
    }
  }
  return null;
}
