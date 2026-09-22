import { FilterBar } from '@/components/catdex/filter-bar';
import { StampModal } from '@/components/catdex/stamp-modal';
import { StickerCanvas } from '@/components/catdex/sticker-canvas';
import { StickerCard } from '@/components/ui/sticker-card';
import { CatColors } from '@/constants/colors';
import { CatRecord } from '@/database/schema';
import { useCatStore } from '@/stores/cat-store';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CatdexSegment = 'cats' | 'stickers';

export default function CatdexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeSegment, setActiveSegment] = useState<CatdexSegment>('cats');
  const [selectedCatForStamp, setSelectedCatForStamp] = useState<CatRecord | null>(null);

  const {
    cats,
    isLoading,
    selectedTemperament,
    loadCats,
    setTemperamentFilter,
  } = useCatStore();

  useFocusEffect(
    useCallback(() => {
      loadCats();
    }, [loadCats])
  );

  const filteredCats = useMemo(() => {
    if (selectedTemperament === 'all') return cats;
    return cats.filter((c) => c.temperament === selectedTemperament);
  }, [cats, selectedTemperament]);

  const handleSelectSegment = (segment: CatdexSegment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSegment(segment);
  };

  const handleOpenCatDetail = (cat: CatRecord) => {
    setSelectedCatForStamp(cat);
  };

  const renderGridItem = ({ item }: { item: CatRecord }) => (
    <StickerCard
      cat={item}
      onPress={() => handleOpenCatDetail(item)}
    />
  );

  return (
    <View style={[styles.screenContainer, { paddingTop: insets.top + 8 }]}>
      {/* Top Header: Catdex & Profile Icon */}
      <View style={styles.headerBar}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Catdex</Text>
        <TouchableOpacity style={styles.profileButton} activeOpacity={0.8}>
          <Ionicons name="person-circle-outline" size={32} color="#135461" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control: Cats | Stickers (Imagens 4 e 5) */}
      <View style={styles.segmentContainer}>
        <View style={styles.segmentPill}>
          <TouchableOpacity
            style={[
              styles.segmentItem,
              activeSegment === 'cats' && styles.segmentItemActive,
            ]}
            onPress={() => handleSelectSegment('cats')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'cats' && styles.segmentTextActive,
              ]}
            >
              Cats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentItem,
              activeSegment === 'stickers' && styles.segmentItemActive,
            ]}
            onPress={() => handleSelectSegment('stickers')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'stickers' && styles.segmentTextActive,
              ]}
            >
              Stickers
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Counter Pill (🐾 X cats ou ✨ X stickers) */}
      <View style={styles.statsRow}>
        <View style={styles.statsPill}>
          <Ionicons
            name={activeSegment === 'cats' ? 'paw' : 'sparkles'}
            size={14}
            color="#135461"
          />
          <Text style={styles.statsText}>
            {activeSegment === 'cats'
              ? `${cats.length} ${cats.length === 1 ? 'cat' : 'cats'}`
              : `${cats.length} ${cats.length === 1 ? 'sticker' : 'stickers'}`}
          </Text>
        </View>
      </View>

      {/* Main View: Grid de Medalhões (Cats) ou Mural Livre (Stickers) */}
      {isLoading && cats.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={CatColors.primary} />
        </View>
      ) : activeSegment === 'stickers' ? (
        <StickerCanvas
          cats={cats}
          onSelectCat={handleOpenCatDetail}
          onAddPress={() => router.push('/capture')}
        />
      ) : (
        <View style={styles.gridWrapper}>
          {/* Filtro por temperamento */}
          <FilterBar
            selectedTemperament={selectedTemperament}
            onSelectTemperament={setTemperamentFilter}
          />

          {filteredCats.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="paw-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Nenhum gatinho encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {cats.length === 0
                  ? 'Você ainda não registrou nenhum gato. Toque no botão de câmera para tirar uma foto!'
                  : 'Nenhum gato corresponde ao filtro selecionado.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredCats}
              keyExtractor={(item) => item.id}
              renderItem={renderGridItem}
              numColumns={3}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={loadCats}
                  tintColor={CatColors.primary}
                />
              }
            />
          )}
        </View>
      )}

      {/* Modal estilo Passport Stamp (Imagem 2) */}
      <StampModal
        visible={selectedCatForStamp !== null}
        cat={selectedCatForStamp}
        totalStampsCount={cats.length}
        onClose={() => setSelectedCatForStamp(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Off-white vintage limpo
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E272E',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  segmentPill: {
    flexDirection: 'row',
    backgroundColor: '#EAECEF',
    borderRadius: 24,
    padding: 4,
    width: '100%',
    maxWidth: 340,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 20,
  },
  segmentItemActive: {
    backgroundColor: '#135461', // Teal vintage ativo
    shadowColor: '#135461',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#636E72',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  statsRow: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(19, 84, 97, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(19, 84, 97, 0.12)',
  },
  statsText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#135461',
  },
  gridWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 110,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E272E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    lineHeight: 20,
  },
});
