import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CatRecord } from '@/database/schema';
import { RetroBadgeFrame } from '@/components/ui/retro-badge-frame';

interface CatPinProps {
  cat: CatRecord;
}

export function CatPin({ cat }: CatPinProps) {
  return (
    <View style={styles.pinContainer}>
      {/* Medalhão Retrô */}
      <View style={styles.badgeWrapper}>
        <RetroBadgeFrame catId={cat.id} size={48}>
          <Image
            source={{ uri: cat.localThumbnailUri || cat.localPhotoUri }}
            style={styles.image}
            contentFit="cover"
          />
        </RetroBadgeFrame>

        {cat.isObfuscated && (
          <View style={styles.privacyIcon}>
            <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Seta Triangular Apontando para o Solo */}
      <View style={[styles.arrow, cat.isObfuscated && styles.arrowObfuscated]} />

      {/* Pílula com o Nome do Gato Flutuando Abaixo (Imagem 3) */}
      <View style={styles.namePill}>
        <Text style={styles.nameText} numberOfLines={1}>
          {cat.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
    width: 80,
    height: 78,
    justifyContent: 'flex-start',
  },
  badgeWrapper: {
    width: 48,
    height: 48,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#C86446',
    marginTop: 2,
  },
  arrowObfuscated: {
    borderTopColor: '#9B59B6',
  },
  privacyIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#9B59B6',
    borderRadius: 7,
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 5,
  },
  namePill: {
    height: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    maxWidth: 78,
  },
  nameText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1E272E',
    textAlign: 'center',
    lineHeight: 13,
  },
});
