import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z.string().refine((val) => mongoose.isValidObjectId(val), { message: 'Invalid id' });

export const createAnalysisSchema = z
  .object({
    resumeId: objectId,
    jobDescriptionText: z.string().trim().max(10000).optional(),
  })
  .strict();

export const listAnalysesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    sort: z.enum(['-createdAt', 'createdAt', '-atsScore', 'atsScore']).default('-createdAt'),
  })
  .partial()
  .strict();

export const analysisIdParamSchema = z.object({ id: objectId }).strict();

export const compareParamsSchema = z.object({ id: objectId, otherId: objectId }).strict();
