import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import PDFDocument from 'pdfkit';

process.env.JWT_ACCESS_SECRET = 'test_access_secret_at_least_32_characters';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32_characters';

const { uploadResume } = await import('../src/middlewares/upload.middleware.js');
const { extractionService } = await import('../src/services/extraction.service.js');
const { errorHandler, notFoundHandler } = await import('../src/middlewares/error.middleware.js');

function generateTestPdf() {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.fontSize(16).text('Test Resume');
    doc.fontSize(11).text('Skills: JavaScript, Node.js, MongoDB, React, Data Analysis, Communication');
    doc.text('Experience: Software engineering internship building full-stack web applications.');
    doc.end();
  });
}

/**
 * Regression test for a confirmed intermittent pdf-parse failure: parsing a
 * byte-identical, perfectly valid PDF occasionally throws ("bad XRef entry" /
 * "Illegal character") for no content-related reason. See the comment above
 * parsePdfWithRetry in extraction.service.js for how this was diagnosed.
 * This test hits the real upload middleware over a real listening HTTP
 * server (not a mocked socket) many times in a row — if the retry
 * workaround regresses or is removed, this should start failing.
 */
test('PDF upload is reliable across many real uploads of the same valid file', async () => {
  const app = express();
  app.post('/upload', uploadResume, async (req, res, next) => {
    try {
      const { text } = await extractionService.extractText(req.file.buffer, req.file.mimetype);
      res.status(201).json({ success: true, textLength: text.length });
    } catch (err) {
      next(err);
    }
  });
  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = app.listen(0);
  const port = server.address().port;
  const fileBuffer = await generateTestPdf();

  try {
    const ATTEMPTS = 25;
    let succeeded = 0;
    for (let i = 0; i < ATTEMPTS; i++) {
      const form = new FormData();
      form.append('resume', new Blob([fileBuffer], { type: 'application/pdf' }), 'resume.pdf');
      const res = await fetch(`http://127.0.0.1:${port}/upload`, { method: 'POST', body: form });
      if (res.status === 201) succeeded++;
    }
    // Allow a very small residual failure rate rather than requiring 100%,
    // since this guards against a regression back to the old ~2-95% failure
    // rate, not against pdf-parse ever failing under any circumstance.
    assert.ok(
      succeeded >= ATTEMPTS - 1,
      `Expected at least ${ATTEMPTS - 1}/${ATTEMPTS} uploads to succeed, got ${succeeded}`
    );
  } finally {
    server.close();
  }
});
