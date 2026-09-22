import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CatRecord } from '@/database/schema';
import { CatColors, TemperamentColors, ContextColors } from '@/constants/colors';
import { CatTemperament, CatContext } from '@/types/domain';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = 440;

interface FlipCardProps {
  cat: CatRecord;
}

export function FlipCard({ cat }: FlipCardProps) {
  const rotateY = useSharedValue(0);
  const isFlipped = useSharedValue(false);

  const toggleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFlipped.value) {
      rotateY.value = withTiming(0, { duration: 400 });
      isFlipped.value = false;
    } else {
      rotateY.value = withTiming(180, { duration: 400 });
      isFlipped.value = true;
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(rotateY.value, [0, 180], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${spin}deg` }],
      opacity: rotateY.value >= 90 ? 0 : 1,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(rotateY.value, [0, 180], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${spin}deg` }],
      opacity: rotateY.value < 90 ? 0 : 1,
    };
  });

  const temperamentConfig = TemperamentColors[cat.temperament as CatTemperament];
  const contextConfig = ContextColors[cat.context as CatContext];

  return (
    <TouchableOpacity activeOpacity={1} onPress={toggleFlip} style={styles.container}>
      {/* Front Face */}
      <Animated.View style={[styles.card, styles.frontCard, frontAnimatedStyle]}>
        <View style={styles.imageBox}>
          <Image source={{ uri: cat.localPhotoUri }} style={styles.image} contentFit="cover" />
          <View style={styles.flipHint}>
            <Ionicons name="swap-horizontal" size={14} color="#FFFFFF" />
            <Text style={styles.flipHintText}>Toque para girar</Text>
          </View>
        </View>

        <View style={styles.frontContent}>
          <Text style={styles.title} numberOfLines={1}>{cat.name}</Text>
          <Text style={styles.breedText}>{cat.breed}</Text>

          <View style={styles.badgeRow}>
            {temperamentConfig && (
              <View style={[styles.badge, { backgroundColor: temperamentConfig.bg }]}>
                <Text style={[styles.badgeText, { color: temperamentConfig.text }]}>
                  {temperamentConfig.label}
                </Text>
              </View>
            )}
            {contextConfig && (
              <View style={[styles.badge, { backgroundColor: contextConfig.bg }]}>
                <Text style={[styles.badgeText, { color: contextConfig.text }]}>
                  {contextConfig.label}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Back Face (Ficha Técnica) */}
      <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
        <View style={styles.backHeader}>
          <Ionicons name="document-text" size={24} color={CatColors.primary} />
          <Text style={styles.backTitle}>Ficha de Campo</Text>
        </View>

        <View style={styles.metaList}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Data do Avistamento</Text>
            <Text style={styles.metaValue}>{cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('pt-BR') : '-'}</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Faixa Etária</Text>
            <Text style={styles.metaValue}>{cat.approxAge}</Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Coordenadas</Text>
            <Text style={styles.metaValue}>
              {cat.latitude.toFixed(4)}, {cat.longitude.toFixed(4)}
              {cat.isObfuscated ? ' (Aproximada)' : ''}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Status de Backup</Text>
            <Text style={[styles.metaValue, { color: cat.isSynced ? '#2ECC71' : '#F39C12' }]}>
              {cat.isSynced ? '✓ Sincronizado na nuvem' : '⚡ Armazenado localmente'}
            </Text>
          </View>

          {cat.notes && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Notas</Text>
              <Text style={styles.metaNotes}>{cat.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.backFooter}>
          <Text style={styles.flipHintTextDark}>Toque para voltar à frente</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
    marginVertical: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'absolute',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
    backfaceVisibility: 'hidden',
  },
  frontCard: {
    padding: 10,
  },
  imageBox: {
    width: '100%',
    height: 290,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  flipHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  flipHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  frontContent: {
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: CatColors.textDark,
  },
  breedText: {
    fontSize: 14,
    color: CatColors.textMuted,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  backCard: {
    padding: 24,
    justifyContent: 'space-between',
    backgroundColor: '#FFFDF9',
    borderColor: '#F39C12',
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: CatColors.textDark,
  },
  metaList: {
    gap: 14,
  },
  metaItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: CatColors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: CatColors.textDark,
  },
  metaNotes: {
    fontSize: 14,
    color: CatColors.textDark,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  backFooter: {
    alignItems: 'center',
  },
  flipHintTextDark: {
    color: CatColors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
