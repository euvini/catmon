import { StampModal } from '@/components/catdex/stamp-modal';
import { PrivacyBadge } from '@/components/map/privacy-badge';
import { CatPin } from '@/components/ui/cat-pin';
import { CatRecord } from '@/database/schema';
import { LocationService } from '@/services/location';
import { ObfuscationService } from '@/services/obfuscation';
import { useCatStore } from '@/stores/cat-store';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const INITIAL_REGION: Region = {
  latitude: -23.55052,
  longitude: -46.633308,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function CatMapScreen() {
  const insets = useSafeAreaInsets();
  const cats = useCatStore((s) => s.cats);
  const loadCats = useCatStore((s) => s.loadCats);
  const mapRef = useRef<MapView>(null);
  const [currentRegion, setCurrentRegion] = useState<Region>(INITIAL_REGION);
  const [selectedCatForStamp, setSelectedCatForStamp] = useState<CatRecord | null>(null);
  const [selectCatPin, setSelectCatPin] = useState<CatRecord | null>(null);

  useEffect(() => {
    loadCats();
    LocationService.getCurrentLocation().then((loc) => {
      const region: Region = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      };
      setCurrentRegion(region);
      mapRef.current?.animateToRegion(region, 800);
    });
  }, [loadCats]);

  const handleRecenter = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const loc = await LocationService.getCurrentLocation();
    mapRef.current?.animateToRegion(
      {
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      600
    );
  };

  return (
    <View style={styles.container}>
      {/* Map View Nativo */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={currentRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {cats.map((cat) => {
          const coords = cat.isObfuscated
            ? ObfuscationService.obfuscateCoordinates(cat.latitude, cat.longitude, cat.id)
            : { latitude: cat.latitude, longitude: cat.longitude };

          return (
            <Marker
              key={cat.id}
              coordinate={coords}
              anchor={{ x: 0.5, y: 0.87 }}
              centerOffset={{ x: 0, y: -29 }}
              tracksViewChanges={false}
              onPress={() => setSelectCatPin(cat)}
            >
              <CatPin cat={cat} />
              <Callout
                tooltip
                onPress={() => setSelectedCatForStamp(cat)}
              >
                <View style={styles.calloutCard}>
                  <Text style={styles.calloutTitle}>{cat.name}</Text>
                  <Text style={styles.calloutSubtitle}>{cat.breed} • {cat.approxAge}</Text>
                  {cat.isObfuscated && (
                    <Text style={styles.calloutObfuscated}>📍 Localização aproximada</Text>
                  )}
                  <View style={styles.calloutAction}>
                    <Text style={styles.calloutActionText}>Ver Passport Stamp →</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Top Floating Bar (Imagem 3) */}
      <View style={[styles.topHeaderContainer, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.topHeaderBar}>
          <TouchableOpacity style={styles.topIconButton} activeOpacity={0.8}>
            <Ionicons name="people-outline" size={20} color="#1E272E" />
          </TouchableOpacity>

          <Text style={styles.topTitle}>Catmon</Text>

          <TouchableOpacity style={styles.topIconButton} activeOpacity={0.8}>
            <Ionicons name="person-outline" size={20} color="#1E272E" />
          </TouchableOpacity>
        </View>

        {/* Stats Pill & Compass / Locate Buttons */}
        <View style={styles.controlsRow} pointerEvents="box-none">
          {/* Stats Pill (🐾 X cats) */}
          <View style={styles.statsPill}>
            <Ionicons name="paw" size={14} color="#135461" />
            <Text style={styles.statsPillText}>
              {cats.length} {cats.length === 1 ? 'cat' : 'cats'}
            </Text>
          </View>

          {/* Right Floating Actions (Locate + Compass) */}
          <View style={styles.rightActionsColumn}>
            <TouchableOpacity
              style={styles.floatingActionBtn}
              onPress={handleRecenter}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={18} color="#135461" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.floatingActionBtn}
              onPress={handleRecenter}
              activeOpacity={0.8}
            >
              <View style={styles.compassContainer}>
                <Ionicons name="compass-outline" size={18} color="#C86446" />
                <Text style={styles.compassLetter}>N</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Badge de Privacidade Ética */}
      <PrivacyBadge />

      {/* Modal estilo Passport Stamp */}
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
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  map: {
    width,
    height,
  },
  topHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E272E',
    letterSpacing: 0.5,
  },
  topIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F3F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  statsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  statsPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#135461',
  },
  rightActionsColumn: {
    gap: 8,
  },
  floatingActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  compassContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassLetter: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C86446',
    marginTop: -2,
  },
  calloutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    width: 190,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E272E',
  },
  calloutSubtitle: {
    fontSize: 12,
    color: '#636E72',
    marginVertical: 4,
  },
  calloutObfuscated: {
    fontSize: 11,
    color: '#9B59B6',
    fontWeight: '600',
    marginBottom: 6,
  },
  calloutAction: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  calloutActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#135461',
  },
});
