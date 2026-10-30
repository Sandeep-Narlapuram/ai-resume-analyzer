import mongoose from 'mongoose';

const { Schema } = mongoose;

const scoreBreakdownSchema = new Schema(
  {
    keywordMatch: { type: Number, min: 0, max: 100, default: 0 },
    formatting: { type: Number, min: 0, max: 100, default: 0 },
    sectionCompleteness: { type: Number, min: 0, max: 100, default: 0 },
    readability: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false }
);

const missingKeywordsSchema = new Schema(
  {
    hardSkills: { type: [String], default: [] },
    softSkills: { type: [String], default: [] },
    tools: { type: [String], default: [] },
  },
  { _id: false }
);

const sectionFeedbackEntrySchema = new Schema(
  {
    status: { type: String, enum: ['good', 'needs_improvement', 'missing'], default: 'needs_improvement' },
    comment: { type: String, default: '' },
  },
  { _id: false }
);

const sectionFeedbackSchema = new Schema(
  {
    summary: sectionFeedbackEntrySchema,
    skills: sectionFeedbackEntrySchema,
    experience: sectionFeedbackEntrySchema,
    education: sectionFeedbackEntrySchema,
    projects: sectionFeedbackEntrySchema,
  },
  { _id: false }
);

const suggestionSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    category: { type: String, default: 'General' },
  },
  { _id: false }
);

const analysisSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    resumeFileName: { type: String },

    jobDescriptionText: { type: String, default: null },

    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },

    atsScore: { type: Number, min: 0, max: 100 },
    scoreBreakdown: scoreBreakdownSchema,
    matchedKeywords: { type: [String], default: [] },
    missingKeywords: missingKeywordsSchema,
    sectionFeedback: sectionFeedbackSchema,
    suggestions: { type: [suggestionSchema], default: [] },

    rawAiResponse: { type: Schema.Types.Mixed, select: false },
    geminiTokensUsed: { type: Number, default: 0 },

    errorMessage: { type: String },
  },
  { timestamps: true }
);

analysisSchema.index({ userId: 1, createdAt: -1 });

analysisSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.rawAiResponse;
    delete ret.__v;
    return ret;
  },
});

export const Analysis = mongoose.model('Analysis', analysisSchema);
