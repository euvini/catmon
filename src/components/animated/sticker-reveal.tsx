import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CatColors } from '@/constants/colors';

interface StickerRevealProps {
  visible: boolean;
  photoUri: string | null;
  catName: string;
  onDismiss: () => void;
}

export function StickerReveal({ visible, photoUri, catName, onDismiss }: StickerRevealProps) {
  const scale = useSharedValue(0.2);
  const rotate = useSharedValue(-15);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Haptics executado na thread JS com total estabilidade
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      scale.value = 0.2;
      rotate.value = -15;
      opacity.value = 0;

      opacity.value = withTiming(1, { duration: 250 });
      scale.value = withSequence(
        withSpring(1.08, { damping: 10, stiffness: 100 }),
        withSpring(1.0, { damping: 14, stiffness: 120 })
      );
      rotate.value = withSpring(-3, { damping: 12, stiffness: 80 });
    }
  }, [visible, opacity, rotate, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  if (!visible || !photoUri) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.cardContainer, animatedStyle]}>
        <View style={styles.stickerCard}>
          <Image source={{ uri: photoUri }} style={styles.stickerImage} contentFit="cover" />
          <View style={styles.stickerFooter}>
            <Text style={styles.catName} numberOfLines={1}>{catName}</Text>
            <View style={styles.tagBadge}>
              <Ionicons name="sparkles" size={14} color="#FF6B6B" />
              <Text style={styles.tagText}>Colecionado!</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onDismiss();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>Ver na Catdex</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
    elevation: 999,
  },
  cardContainer: {
    width: 280,
    alignItems: 'center',
  },
  stickerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  stickerImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  stickerFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  catName: {
    fontSize: 22,
    fontWeight: '800',
    color: CatColors.textDark,
    marginBottom: 6,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '700',
  },
  continueButton: {
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: CatColors.textDark,
    fontSize: 17,
    fontWeight: '700',
  },
});
