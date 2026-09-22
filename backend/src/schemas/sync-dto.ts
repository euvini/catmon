import { z } from 'zod';

export const SyncCatItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  breed: z.string(),
  context: z.enum(['stray', 'friend_pet', 'community', 'cat_cafe', 'other']),
  color: z.string(),
  temperament: z.enum(['friendly', 'shy', 'playful', 'sleeper']),
  approx_age: z.enum(['kitten', 'young', 'adult', 'senior']),
  latitude: z.number(),
  longitude: z.number(),
  is_obfuscated: z.boolean().default(false),
  remote_photo_url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SyncPushPayloadSchema = z.object({
  cats: z.array(SyncCatItemSchema),
});

export type SyncPushPayload = z.infer<typeof SyncPushPayloadSchema>;
export type SyncCatItem = z.infer<typeof SyncCatItemSchema>;
