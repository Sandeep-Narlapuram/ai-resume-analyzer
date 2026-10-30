import { z } from 'zod';
import mongoose from 'mongoose';

const objectId = z.string().refine((val) => mongoose.isValidObjectId(val), { message: 'Invalid id' });

export const userIdParamSchema = z.object({ id: objectId }).strict();

export const setUserStatusSchema = z.object({ isActive: z.boolean() }).strict();
