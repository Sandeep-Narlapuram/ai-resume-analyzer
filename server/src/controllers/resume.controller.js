import { extractionService } from '../services/extraction.service.js';
import { storageService } from '../services/storage.service.js';
import { resumeRepository } from '../repositories/resume.repository.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const resumeController = {
  async upload(req, res) {
    if (!req.file) {
      throw AppError.badRequest('No file was uploaded', 'MISSING_FILE');
    }

    const { buffer, originalname, mimetype, size } = req.file;

    // Text is extracted (and its magic bytes verified) before the file is
    // ever persisted, so we never store something that fails validation.
    const { text, fileType } = await extractionService.extractText(buffer, mimetype);
    const { key } = await storageService.save(buffer, originalname);

    const resume = await resumeRepository.create({
      userId: req.user.id,
      originalFileName: originalname,
      storageKey: key,
      fileType,
      fileSizeBytes: size,
      extractedText: text,
    });

    sendSuccess(res, {
      data: { resumeId: resume._id, fileName: resume.originalFileName },
      status: 201,
    });
  },

  async list(req, res) {
    const resumes = await resumeRepository.listByUser(req.user.id);
    sendSuccess(res, { data: resumes });
  },

  async getById(req, res) {
    const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user.id);
    if (!resume) throw AppError.notFound('Resume not found');
    sendSuccess(res, { data: resume });
  },

  async remove(req, res) {
    const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user.id, { withText: true });
    if (!resume) throw AppError.notFound('Resume not found');

    await storageService.delete(resume.storageKey);
    await resumeRepository.deleteByIdAndUser(req.params.id, req.user.id);

    sendSuccess(res, { message: 'Resume deleted' });
  },

  /**
   * Streams the original resume file back to its owner. This is the only
   * way to read a stored resume — there is no public/static URL for it.
   */
  async download(req, res) {
    const resume = await resumeRepository.findByIdAndUser(req.params.id, req.user.id, { withStorageKey: true });
    if (!resume) throw AppError.notFound('Resume not found');

    const buffer = await storageService.read(resume.storageKey);
    if (!buffer) throw AppError.notFound('The stored file could not be found');

    const contentType =
      resume.fileType === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${resume.originalFileName}"`);
    res.send(buffer);
  },
};
