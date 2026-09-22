import { CatTemperament, CatContext } from '@/types/domain';

export const CatColors = {
  primary: '#135461', // Vintage Teal
  primaryCoral: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#FFE66D',
  backgroundLight: '#F5F4EE', // Off-white vintage canvas
  cardLight: '#FFFFFF',
  textDark: '#1E272E',
  textMuted: '#636E72',
  stickerBorder: '#FFFFFF',
  stickerShadow: 'rgba(45, 52, 54, 0.16)',

  // Vintage Camera Body Tokens (Image 1)
  cameraChassis: '#ECEBE4',
  cameraChassisBorder: '#DFDED7',
  cameraBezel: '#242424',
  cameraSensorDot: '#1A1A1A',
  shutterOrange: '#F15A24',
  shutterOrangeHighlight: '#FF7039',
  shutterOrangeDark: '#C94514',
  cameraGaugeRed: '#E74C3C',
  cameraGaugeLine: '#4A4A4A',
  cameraKnurledWheel: '#1F1F1F',
  cameraKnurledAmber: '#E67E22',

  // Liquid Glass & Navigation Tokens (Images 3, 4, 5)
  glassTint: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.85)',
  glassShadow: 'rgba(0, 0, 0, 0.08)',
  tabBarTeal: '#135461',
  tabBarTealActive: '#0E3E47',
} as const;

export const RetroBadgePalettes = [
  { id: 'terracotta', primary: '#C86446', secondary: '#FBF0EB', border: '#D87556', name: 'Terracota' },
  { id: 'mint', primary: '#5E9B82', secondary: '#EBF4F0', border: '#6EAA92', name: 'Menta' },
  { id: 'iceBlue', primary: '#548CA8', secondary: '#EDF5F8', border: '#669CB6', name: 'Azul Gelo' },
  { id: 'ochre', primary: '#C48F32', secondary: '#FCF7EE', border: '#D4A044', name: 'Ocre' },
  { id: 'blush', primary: '#BF6670', secondary: '#FBF0F2', border: '#CE7882', name: 'Rosa Vintage' },
  { id: 'sage', primary: '#7A8F70', secondary: '#F2F6F0', border: '#8A9E80', name: 'Oliva' },
] as const;


export const TemperamentColors: Record<CatTemperament, { bg: string; text: string; label: string; icon: string }> = {
  friendly: {
    bg: '#E8F8F5',
    text: '#117A65',
    label: 'Dócil',
    icon: 'heart.fill',
  },
  shy: {
    bg: '#F4ECF7',
    text: '#76448A',
    label: 'Arredio',
    icon: 'eye.slash.fill',
  },
  playful: {
    bg: '#FEF9E7',
    text: '#B7950B',
    label: 'Brincalhão',
    icon: 'bolt.fill',
  },
  sleeper: {
    bg: '#EBF5FB',
    text: '#2874A6',
    label: 'Dorminhoco',
    icon: 'moon.zzz.fill',
  },
};

export const ContextColors: Record<CatContext, { bg: string; text: string; label: string }> = {
  stray: {
    bg: '#FADBD8',
    text: '#922B21',
    label: 'De Rua',
  },
  friend_pet: {
    bg: '#E8DAEF',
    text: '#6C3483',
    label: 'Pet de Amigo',
  },
  community: {
    bg: '#D4EFDF',
    text: '#1E8449',
    label: 'Comunitário',
  },
  cat_cafe: {
    bg: '#FCF3CF',
    text: '#9A7D0A',
    label: 'Cat Café',
  },
  other: {
    bg: '#EAECEE',
    text: '#2C3E50',
    label: 'Outro',
  },
};

export const CoatColors: Record<string, { label: string; hex: string }> = {
  orange_caramel: { label: 'Laranja / Caramelo', hex: '#E67E22' },
  solid_black: { label: 'Preto', hex: '#2C3E50' },
  solid_white: { label: 'Branco', hex: '#ECF0F1' },
  tuxedo: { label: 'Frajola', hex: '#34495E' },
  tabby: { label: 'Rajado', hex: '#95A5A6' },
  calico_tortie: { label: 'Tricolor / Escaminha', hex: '#D35400' },
  siamese_point: { label: 'Siamês', hex: '#BDC3C7' },
  bicolor: { label: 'Bicolor', hex: '#7F8C8D' },
  other: { label: 'Outro', hex: '#95A5A6' },
};
