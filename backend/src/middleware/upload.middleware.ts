// middleware/upload.middleware.ts
import multer from 'multer';
import { Request } from 'express';
import path from 'path';

const MAX_FILE_SIZE_MB = Number(process.env.UPLOAD_MAX_MB || 10);
const ACCEPT_MIME = (process.env.UPLOAD_ACCEPT || 'image/png,image/jpeg,image/webp').split(',');

// In memory storage. For large files consider diskStorage or a direct-to-object-storage flow.
const storage = multer.memoryStorage();

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (!ACCEPT_MIME.includes(file.mimetype)) {
    return cb(new Error('Unsupported file type'));
  }
  cb(null, true);
}

export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
}).single('file'); // form field name

export const uploadMultipleImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: Number(process.env.UPLOAD_MAX_FILES || 6),
  },
}).array('files');

/**
 * Example sanitizer to build a safe filename if you switch to diskStorage
 */
export function safeFilename(original: string) {
  const base = path.basename(original, path.extname(original));
  const ext = path.extname(original).toLowerCase();
  return base.replace(/[^\w\-]+/g, '_') + '_' + Date.now() + ext;
}
