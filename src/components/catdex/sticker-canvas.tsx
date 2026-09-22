import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CatRecord } from '@/database/schema';

interface StickerCanvasProps {
  cats: CatRecord[];
  onSelectCat: (cat: CatRecord) => void;
  onAddPress: () => void;
}

export function StickerCanvas({ cats, onSelectCat, onAddPress }: StickerCanvasProps) {
  // Gera posições e rotações orgânicas determinísticas por ID
  const stickerConfigs = useMemo(() => {
    return cats.map((cat, idx) => {
      let hash = 0;
      for (let i = 0; i < cat.id.length; i++) {
        hash = (hash << 5) - hash + cat.id.charCodeAt(i);
        hash |= 0;
      }
      const rotation = ((Math.abs(hash) % 15) - 7); // -7 a +7 graus
      const size = 96 + (Math.abs(hash) % 24); // 96 a 120px

      return {
        cat,
        rotation,
        size,
        key: `sticker-${cat.id}-${idx}`,
      };
    });
  }, [cats]);

  return (
    <View style={styles.canvasContainer}>
      {/* Padrão sutil de pegadas d'água de fundo */}
      <View style={styles.watermarkGrid} pointerEvents="none">
        {Array.from({ length: 18 }).map((_, i) => (
          <View
            key={`paw-bg-${i}`}
            style={[
              styles.watermarkPaw,
              {
                top: `${(Math.floor(i / 3) * 16) + 4}%`,
                left: `${((i % 3) * 34) + 6}%`,
                transform: [{ rotate: `${(i * 37) % 360}deg` }],
              },
            ]}
          >
            <Ionicons name="paw" size={32} color="rgba(0, 0, 0, 0.035)" />
          </View>
        ))}
      </View>

      {/* Lista/Mural de Stickers Orgânicos */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stickersWrap}>
          {stickerConfigs.map((cfg) => (
            <View
              key={cfg.key}
              style={[
                styles.stickerItem,
                { transform: [{ rotate: `${cfg.rotation}deg` }] },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelectCat(cfg.cat);
                }}
                style={styles.stickerCard}
              >
                {/* Adesivo com Contorno Branco Espesso e Sombra Física */}
                <View
                  style={[
                    styles.dieCutBorder,
                    { width: cfg.size, height: cfg.size, borderRadius: cfg.size / 2 },
                  ]}
                >
                  <Image
                    source={{ uri: cfg.cat.localThumbnailUri || cfg.cat.localPhotoUri }}
                    style={styles.stickerImage}
                    contentFit="cover"
                    transition={150}
                  />
                </View>

                {/* Pílula de Nome Flutuante */}
                <View style={styles.namePill}>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {cfg.cat.name}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Botão Flutuante Circular de Adicionar no Canto Inferior Direito */}
      <TouchableOpacity
        style={styles.fabButton}
        activeOpacity={0.85}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onAddPress();
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  canvasContainer: {
    flex: 1,
    backgroundColor: '#F7F6F0', // Fundo marfim vintage acolhedor
    position: 'relative',
  },
  watermarkGrid: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  watermarkPaw: {
    position: 'absolute',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110, // Espaço para barra flutuante
  },
  stickersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 20,
  },
  stickerItem: {
    marginVertical: 10,
    alignItems: 'center',
  },
  stickerCard: {
    alignItems: 'center',
  },
  dieCutBorder: {
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  namePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    maxWidth: 90,
  },
  nameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  fabButton: {
    position: 'absolute',
    bottom: 96,
    right: 22,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#135461',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#135461',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
});
