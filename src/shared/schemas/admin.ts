/**
 * Admin-related schemas
 */

import { z } from "zod";

// ============================================
// Image Sets
// ============================================

export const difficultySchema = z.enum(["easy", "medium", "hard"]);

export type Difficulty = z.infer<typeof difficultySchema>;

export const createImageSetSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(2).max(50),
  difficulty: difficultySchema,
  innocentImageUrl: z.string().url(),
  imposterImageUrl: z.string().url(),
});

export type CreateImageSetInput = z.infer<typeof createImageSetSchema>;

// Form variant (without URLs, for client-side validation before upload)
export const imageSetFormSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.string().min(1),
  difficulty: difficultySchema,
});

export type ImageSetFormInput = z.infer<typeof imageSetFormSchema>;
