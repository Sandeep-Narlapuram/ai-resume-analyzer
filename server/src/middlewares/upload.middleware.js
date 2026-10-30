import multer from 'multer';
import path from 'node:path';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx']);

// Magic bytes for the file types we accept — checked in the extraction
// service against the actual buffer, not just the client-supplied MIME type,
// since Content-Type headers can be spoofed.
export const MAGIC_BYTES = {
  pdf: Buffer.from('25504446', 'hex'), // %PDF
  docx: Buffer.from('504B0304', 'hex'), // PK.. (zip-based OOXML)
};

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(AppError.badRequest('Only PDF or DOCX files are supported', 'INVALID_FILE_TYPE'));
  }
  cb(null, true);
}

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.storage.maxUploadSizeMb * 1024 * 1024,
    files: 1,
  },
}).single('resume');

/**
 * Verifies the uploaded buffer actually starts with the expected magic bytes
 * for its claimed type, mitigating extension/MIME spoofing. Call this after
 * uploadResume in the controller, before persisting or parsing the file.
 */
export function verifyMagicBytes(buffer, fileType) {
  const expected = MAGIC_BYTES[fileType];
  if (!expected) return false;
  return buffer.subarray(0, expected.length).equals(expected);
}
