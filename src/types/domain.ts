import { z } from 'zod';

export type UUID = string;
export type ISO8601Timestamp = string;

export const CatContextEnum = z.enum([
  'stray',       // Gato de rua / sem tutor evidente
  'friend_pet',  // Pet de amigo / residência privada
  'community',   // Gato comunitário (praça, comércio)
  'cat_cafe',    // Gato de cafeteria
  'other',       // Outro contexto
]);
export type CatContext = z.infer<typeof CatContextEnum>;

export const CoatPatternEnum = z.enum([
  'tabby',          // Rajado
  'solid_black',    // Preto sólido
  'solid_white',    // Branco sólido
  'orange_caramel', // Laranja / Caramelo
  'tuxedo',         // Frajola
  'calico_tortie',  // Tricolor / Escaminha
  'siamese_point',  // Siamês
  'bicolor',        // Bicolor
  'other',
]);
export type CoatPattern = z.infer<typeof CoatPatternEnum>;

export const CatTemperamentEnum = z.enum([
  'friendly', // Dócil
  'shy',      // Arredio / tímido
  'playful',  // Brincalhão
  'sleeper',  // Dorminhoco
]);
export type CatTemperament = z.infer<typeof CatTemperamentEnum>;

export const ApproxAgeEnum = z.enum([
  'kitten', // Filhote (< 6m)
  'young',  // Jovem (6m - 2a)
  'adult',  // Adulto (2a - 8a)
  'senior', // Idoso (8a+)
]);
export type ApproxAge = z.infer<typeof ApproxAgeEnum>;

export const LocationPrivacyModeEnum = z.enum([
  'exact',   // Coordenadas exatas
  'blurred', // Ofuscação radial aplicada (150m-300m)
  'manual',  // Inserida ou ajustada manualmente
]);
export type LocationPrivacyMode = z.infer<typeof LocationPrivacyModeEnum>;

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  isObfuscated: boolean;
  roughNeighborhood?: string;
  roughCity?: string;
}

export const CatSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).default('Gato Misterioso'),
  breed: z.string().default('SRD (Sem Raça Definida)'),
  context: CatContextEnum.default('stray'),
  color: z.string().default('#F39C12'),
  temperament: CatTemperamentEnum.default('friendly'),
  approxAge: ApproxAgeEnum.default('adult'),
  latitude: z.number(),
  longitude: z.number(),
  isObfuscated: z.boolean().default(false),
  localPhotoUri: z.string(),
  localThumbnailUri: z.string().nullable().optional(),
  remotePhotoUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isSynced: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Cat = z.infer<typeof CatSchema>;

export const CreateCatInputSchema = CatSchema.omit({
  createdAt: true,
  updatedAt: true,
  isSynced: true,
  remotePhotoUrl: true,
});

export type CreateCatInput = z.infer<typeof CreateCatInputSchema>;
