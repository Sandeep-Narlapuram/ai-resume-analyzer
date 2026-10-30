import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Thin storage abstraction so the rest of the app never needs to know
 * whether files live on local disk (dev) or S3/Cloud Storage (prod).
 * Swap the local branch for an S3 SDK call when STORAGE_PROVIDER=s3 —
 * the interface (save/delete/getUrl) stays the same either way.
 */
export const storageService = {
  /**
   * Saves the buffer and returns only an opaque storage key — no public URL.
   * Files are never directly browsable; the only way to read one back is
   * through storageService.read(), called from an authenticated,
   * ownership-checked controller (see resumeController.download).
   */
  async save(buffer, originalFileName) {
    const ext = path.extname(originalFileName);
    const key = `${crypto.randomUUID()}${ext}`;

    if (env.storage.provider === 'local') {
      await fs.mkdir(env.storage.localDir, { recursive: true });
      const filePath = path.join(env.storage.localDir, key);
      await fs.writeFile(filePath, buffer);
      return { key };
    }

    // Placeholder for S3: upload with server-side encryption enabled, bucket
    // policy denying public read, and object access only via short-lived
    // signed URLs generated per-request in read() below. Left unimplemented
    // here since it depends on the deployment's AWS SDK version and bucket
    // policy — see architecture doc future enhancements.
    throw new Error('S3 storage provider is not yet implemented — set STORAGE_PROVIDER=local for now');
  },

  async delete(key) {
    if (env.storage.provider === 'local') {
      const filePath = path.join(env.storage.localDir, key);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          logger.warn({ err, key }, 'Failed to delete stored resume file');
        }
      }
      return;
    }
    throw new Error('S3 storage provider is not yet implemented');
  },

  /**
   * Reads a stored file back into a buffer. Callers MUST verify the
   * requesting user owns the resume before calling this — this function
   * has no knowledge of ownership itself.
   */
  async read(key) {
    if (env.storage.provider === 'local') {
      const filePath = path.join(env.storage.localDir, key);
      try {
        return await fs.readFile(filePath);
      } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
      }
    }
    // Placeholder for S3: fetch the object (or return a short-lived signed
    // URL for the caller to redirect to) using the same bucket policy noted
    // in save() above.
    throw new Error('S3 storage provider is not yet implemented');
  },
};
