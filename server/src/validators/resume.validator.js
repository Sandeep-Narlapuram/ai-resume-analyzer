import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z.string().refine((val) => mongoose.isValidObjectId(val), { message: 'Invalid id' });

export const resumeIdParamSchema = z.object({ id: objectId }).strict();
