export const BOOKING_ALLOWED_MIMES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const BOOKING_ALLOWED_TYPES_LABEL = "PDF, JPEG, PNG, WebP, or Word (.doc, .docx)";

export const MAX_BOOKING_FILE_BYTES = 5 * 1024 * 1024;

const VIDEO_EXT = /\.(mp4|mov|avi|webm|mkv|m4v|wmv|mpeg|mpg|3gp)$/i;

export function validateBookingFiles(files: FileList | null): string | null {
  if (!files?.length) return null;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (f.type.startsWith("video/") || VIDEO_EXT.test(f.name)) {
      return `${f.name}: video files are not allowed. Allowed types: ${BOOKING_ALLOWED_TYPES_LABEL}.`;
    }
    if (f.size > MAX_BOOKING_FILE_BYTES) {
      return `${f.name} exceeds the 5MB size limit per file.`;
    }
    if (!BOOKING_ALLOWED_MIMES.includes(f.type)) {
      return `${f.name} has an unsupported file type. Allowed types: ${BOOKING_ALLOWED_TYPES_LABEL}.`;
    }
  }
  return null;
}
