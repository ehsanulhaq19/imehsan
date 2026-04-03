/** Appointment / generic upload validation helpers */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export const APPOINTMENT_UPLOAD_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export function assertMimeAllowed(mime: string, allowed: string[]) {
  if (!allowed.includes(mime)) {
    throw new Error(`Invalid file type: ${mime}`);
  }
}
