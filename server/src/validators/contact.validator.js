import { z } from 'zod';

export const contactMessageSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email(),
    subject: z.string().trim().min(2).max(150),
    message: z.string().trim().min(10, 'Add a little more detail').max(5000),
  })
  .strict();
