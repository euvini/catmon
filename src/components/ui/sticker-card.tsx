import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CatRecord } from '@/database/schema';
import { RetroBadgeFrame } from '@/components/ui/retro-badge-frame';

interface StickerCardProps {
  cat: CatRecord;
  onPress: () => void;
  size?: number;
}

export function StickerCard({ cat, onPress, size = 94 }: StickerCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Extrai nome de rua ou bairro amigável ou padrão
  const locationLabel = cat.isObfuscated
    ? 'Local aproximado'
    : cat.notes?.includes('Rua')
    ? cat.notes.split('\n')[0]
    : 'Avistado na cidade';

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.82}
      onPress={handlePress}
    >
      {/* Medalhão Retrô com Foto */}
      <View style={styles.badgeWrapper}>
        <RetroBadgeFrame catId={cat.id} size={size}>
          <Image
            source={{ uri: cat.localThumbnailUri || cat.localPhotoUri }}
            style={styles.photo}
            contentFit="cover"
            transition={180}
          />
        </RetroBadgeFrame>

        {/* Indicador discreto de sincronização */}
        {cat.isSynced ? (
          <View style={styles.syncedDot} />
        ) : (
          <View style={styles.offlineDot} />
        )}
      </View>

      {/* Metadados Vintage (Nome, Raça, Localização) */}
      <View style={styles.infoContainer}>
        <Text style={styles.catName} numberOfLines={1}>
          {cat.name}
        </Text>

        <Text style={styles.catBreed} numberOfLines={1}>
          {cat.breed || 'Sem raça definida'}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={10} color="#7F8C8D" />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationLabel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    maxWidth: '33.33%',
  },
  badgeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  syncedDot: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 4,
  },
  offlineDot: {
    position: 'absolute',
    top: 2,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F39C12',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 4,
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  catName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E272E',
    textAlign: 'center',
  },
  catBreed: {
    fontSize: 10.5,
    color: '#636E72',
    marginTop: 2,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 3,
    paddingHorizontal: 2,
  },
  locationText: {
    fontSize: 9.5,
    color: '#7F8C8D',
    maxWidth: 90,
  },
});
