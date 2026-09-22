import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CatRecord } from '@/database/schema';
import { RetroBadgeFrame } from '@/components/ui/retro-badge-frame';

interface StampModalProps {
  visible: boolean;
  cat: CatRecord | null;
  totalStampsCount: number;
  onClose: () => void;
}

export function StampModal({
  visible,
  cat,
  totalStampsCount,
  onClose,
}: StampModalProps) {
  if (!cat) return null;

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Share.share({
        message: `🐾 Acabei de carimbar o gato "${cat.name}" no meu Catmon! Raça: ${cat.breed || 'SRD'}.`,
      });
    } catch {
      // Ignora cancelamento
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        {/* Top Header estilo Passport */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.circleButton} onPress={handleClose} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Passport</Text>
            <Text style={styles.headerSubtitle}>
              {totalStampsCount === 1 ? '1 stamp coletado' : `${totalStampsCount} stamps coletados`}
            </Text>
          </View>

          <TouchableOpacity style={styles.circleButton} onPress={handleShare} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Fundo com marcas de carimbos d'água sutis */}
        <View style={styles.watermarkSeal} pointerEvents="none">
          <Ionicons name="ribbon-outline" size={160} color="rgba(255,255,255,0.03)" />
        </View>

        {/* Bottom Sheet Card Estilo Passport Stamp (Imagem 2) */}
        <View style={styles.sheetCard}>
          {/* Carimbo Ilustrado em Destaque */}
          <View style={styles.stampOuterFrame}>
            <RetroBadgeFrame catId={cat.id} size={140}>
              <Image
                source={{ uri: cat.localPhotoUri }}
                style={styles.stampImage}
                contentFit="cover"
                transition={200}
              />
            </RetroBadgeFrame>
          </View>

          {/* Nome e Metadados do Gato */}
          <Text style={styles.catName}>{cat.name}</Text>

          <Text style={styles.catDescription}>
            {cat.notes ||
              `Felino do tipo ${cat.breed || 'SRD'} com temperamento ${cat.temperament || 'amigável'}, catalogado como ${cat.context === 'stray' ? 'gato de rua' : 'pet especial'}.`}
          </Text>

          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#2ECC71" />
            <Text style={styles.statusText}>
              {cat.isObfuscated
                ? 'Coordenadas protegidas • Bairro aproximado'
                : 'Marcado como visitado • Coordenadas salvas'}
            </Text>
          </View>

          {/* Botão de Ação Compartilhar */}
          <TouchableOpacity
            style={styles.shareButton}
            activeOpacity={0.88}
            onPress={handleShare}
          >
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 12, 16, 0.88)',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
    fontWeight: '500',
  },
  watermarkSeal: {
    position: 'absolute',
    top: '30%',
    left: '30%',
  },
  sheetCard: {
    backgroundColor: 'rgba(24, 28, 34, 0.95)',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  stampOuterFrame: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampImage: {
    width: '100%',
    height: '100%',
  },
  catName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  catDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.72)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  shareButtonText: {
    color: '#111418',
    fontSize: 16,
    fontWeight: '700',
  },
});
