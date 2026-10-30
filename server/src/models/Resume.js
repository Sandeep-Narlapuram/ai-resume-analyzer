import mongoose from 'mongoose';

const { Schema } = mongoose;

const resumeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalFileName: { type: String, required: true },
    // Provider-specific key only — deliberately no public storageUrl field.
    // Files are readable only via the authenticated, ownership-checked
    // GET /resumes/:id/file route (see resumeController.download).
    storageKey: { type: String, required: true, select: false },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    fileSizeBytes: { type: Number, required: true },
    extractedText: { type: String, required: true, select: false },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

resumeSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.extractedText;
    delete ret.storageKey;
    delete ret.__v;
    return ret;
  },
});

export const Resume = mongoose.model('Resume', resumeSchema);
