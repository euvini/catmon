import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useIsFocused } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatColors } from '@/constants/colors';

interface CameraCaptureViewProps {
  onPhotoCaptured: (uri: string) => void;
  onClose?: () => void;
  isActive?: boolean;
}

export function CameraCaptureView({ onPhotoCaptured, onClose, isActive = true }: CameraCaptureViewProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isFocused = useIsFocused();
  const shouldBeActive = isActive && isFocused;
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={CatColors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Ionicons name="camera-outline" size={64} color={CatColors.primary} />
        <Text style={styles.permissionTitle}>Permissão de Câmera Necessária</Text>
        <Text style={styles.permissionText}>
          O Catmon precisa da câmera para registrar os gatos que você avistar pelo caminho.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Habilitar Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo?.uri) {
        onPhotoCaptured(photo.uri);
      }
    } catch {
      // Tratamento de erro na captura
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        onPhotoCaptured(result.assets[0].uri);
      }
    } catch {
      // Cancelamento tratado
    }
  };

  const toggleFacing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // Renderiza matriz de pontos da grelha de sensores/alto-falante
  const renderGrilleDots = (keyPrefix: string) => {
    const rows = [0, 1, 2];
    const cols = [0, 1, 2, 3, 4, 5, 6];

    return (
      <View style={styles.grilleContainer}>
        {rows.map((r) => (
          <View key={`${keyPrefix}-r-${r}`} style={styles.grilleRow}>
            {cols.map((c) => (
              <View key={`${keyPrefix}-c-${r}-${c}`} style={styles.grilleDot} />
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header Bar inside Viewfinder area */}
      <View style={styles.viewfinderHeader}>
        <TouchableOpacity style={styles.viewfinderButton} onPress={handleClose} activeOpacity={0.8}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.vintageBrandBadge}>
          <Text style={styles.vintageBrandText}>CATMON 35MM</Text>
        </View>

        <TouchableOpacity style={styles.viewfinderButton} onPress={toggleFlash} activeOpacity={0.8}>
          <Ionicons
            name={flash === 'on' ? 'flash' : 'flash-off'}
            size={20}
            color={flash === 'on' ? '#FFD166' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* Live Viewfinder Window */}
      <View style={styles.viewfinderFrame}>
        {shouldBeActive ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            enableTorch={flash === 'on'}
            active={shouldBeActive}
          >
            {/* Subtle Viewfinder Crosshairs */}
            <View style={styles.viewfinderOverlay}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
          </CameraView>
        ) : (
          <View style={[styles.camera, { backgroundColor: '#1C1E22' }]} />
        )}
      </View>

      {/* Vintage Physical Camera Console (Image 1 Inspiration) */}
      <View style={[styles.cameraBody, { paddingBottom: Math.max(insets.bottom, 18) }]}>
        {/* Upper Console Strip: Cassette gauge & toggles */}
        <View style={styles.consoleTopRow}>
          {/* Left: Sensor eye + vertical pill */}
          <View style={styles.sensorPair}>
            <View style={styles.cameraLensDot}>
              <View style={styles.lensReflection} />
            </View>
            <View style={styles.indicatorPill} />
          </View>

          {/* Center: Analog Exposure / Film Gauge Capsule */}
          <View style={styles.filmGaugeCapsule}>
            <View style={styles.filmTrack}>
              <View style={styles.gaugeRedLine} />
              <View style={styles.gaugeDotsLine}>
                <View style={styles.gaugeDot} />
                <View style={styles.gaugeDot} />
                <View style={styles.gaugeDot} />
                <View style={styles.gaugeDot} />
                <View style={styles.gaugeDot} />
              </View>
            </View>
            <View style={styles.gaugeIconWrapper}>
              <Ionicons name="chatbubble-ellipses-outline" size={13} color="#4A4A4A" />
            </View>
          </View>

          {/* Right: Camera Flip Slide Switch + Dial screw */}
          <View style={styles.consoleRightControls}>
            <TouchableOpacity
              style={styles.mechanicalSwitch}
              onPress={toggleFacing}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.mechanicalSwitchKnob,
                  facing === 'front' && styles.mechanicalSwitchKnobActive,
                ]}
              >
                <Ionicons name="camera-reverse-outline" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.metalScrewAccent}>
              <View style={styles.screwSlot} />
            </View>
          </View>
        </View>

        {/* Center Console: Perforated Grilles + Huge Orange Shutter Button */}
        <View style={styles.shutterRow}>
          {/* Left Grille */}
          {renderGrilleDots('left')}

          {/* Mechanical Shutter Button */}
          <TouchableOpacity
            style={[styles.shutterBezel, isCapturing && styles.shutterBezelPressed]}
            onPress={handleTakePicture}
            disabled={isCapturing}
            activeOpacity={0.82}
          >
            <View style={styles.shutterInnerShadow}>
              <View style={styles.shutterOrangeCap}>
                {isCapturing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.shutterCenterGleam} />
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Right Grille */}
          {renderGrilleDots('right')}
        </View>

        {/* Lower Console: Knurled Thumb Dial & Gallery Button */}
        <View style={styles.consoleBottomRow}>
          {/* Gallery Button */}
          <TouchableOpacity
            style={styles.auxButton}
            onPress={handlePickFromGallery}
            activeOpacity={0.8}
          >
            <Ionicons name="images-outline" size={20} color="#333333" />
            <Text style={styles.auxButtonText}>Rolo</Text>
          </TouchableOpacity>

          {/* Knurled Aperture Wheel with Amber Center Marker */}
          <View style={styles.knurledWheel}>
            {[...Array(14)].map((_, i) => (
              <View
                key={`groove-${i}`}
                style={[
                  styles.knurledGroove,
                  i === 7 && styles.knurledAmberMarker,
                ]}
              />
            ))}
          </View>

          {/* Mode Badge */}
          <View style={styles.auxBadge}>
            <Ionicons name="paw" size={14} color="#135461" />
            <Text style={styles.auxBadgeText}>CAT 1X</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0F12',
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: CatColors.textDark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: CatColors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: CatColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Viewfinder
  viewfinderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  viewfinderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vintageBrandBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  vintageBrandText: {
    color: '#ECEBE4',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  viewfinderFrame: {
    flex: 1,
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#1C1E22',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  camera: {
    flex: 1,
  },
  viewfinderOverlay: {
    flex: 1,
    position: 'relative',
    margin: 20,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },

  // Physical Camera Body (Console)
  cameraBody: {
    backgroundColor: CatColors.cameraChassis,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 2,
    borderColor: CatColors.cameraChassisBorder,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },

  // Top Console Row
  consoleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sensorPair: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 60,
  },
  cameraLensDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1E1E1E',
    borderWidth: 2,
    borderColor: '#4A4A4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lensReflection: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  indicatorPill: {
    width: 8,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#1E1E1E',
    borderWidth: 1.5,
    borderColor: '#D4D3CB',
  },

  // Film / Exposure Status Capsule
  filmGaugeCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D5D4CC',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  filmTrack: {
    width: 110,
    height: 16,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  gaugeRedLine: {
    height: 2,
    backgroundColor: CatColors.cameraGaugeRed,
    borderRadius: 1,
    width: '90%',
  },
  gaugeDotsLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    paddingTop: 3,
  },
  gaugeDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: CatColors.cameraGaugeLine,
  },
  gaugeIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECEBE4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D5D4CC',
  },

  // Right Console Controls
  consoleRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    width: 60,
  },
  mechanicalSwitch: {
    width: 24,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    padding: 2,
    justifyContent: 'space-between',
  },
  mechanicalSwitchKnob: {
    width: 20,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3D3D3D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mechanicalSwitchKnobActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#135461',
  },
  metalScrewAccent: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D1D0C8',
    borderWidth: 1,
    borderColor: '#9E9D96',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screwSlot: {
    width: 8,
    height: 1.5,
    backgroundColor: '#6E6D67',
  },

  // Center Shutter Row
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  grilleContainer: {
    width: 90,
    gap: 7,
    alignItems: 'center',
  },
  grilleRow: {
    flexDirection: 'row',
    gap: 7,
  },
  grilleDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.25,
    backgroundColor: CatColors.cameraSensorDot,
  },

  // Mechanical Orange Shutter Button
  shutterBezel: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: CatColors.cameraBezel,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#191919',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  shutterBezelPressed: {
    transform: [{ scale: 0.96 }],
  },
  shutterInnerShadow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterOrangeCap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: CatColors.shutterOrange,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: CatColors.shutterOrangeHighlight,
    shadowColor: CatColors.shutterOrangeDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  shutterCenterGleam: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  // Lower Console Controls
  consoleBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 8,
  },
  auxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAF9F5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D5D4CC',
  },
  auxButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333333',
  },
  knurledWheel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CatColors.cameraKnurledWheel,
    height: 24,
    width: 140,
    borderRadius: 6,
    paddingHorizontal: 4,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#383838',
  },
  knurledGroove: {
    width: 3,
    height: 16,
    borderRadius: 1.5,
    backgroundColor: '#4A4A4A',
  },
  knurledAmberMarker: {
    backgroundColor: CatColors.cameraKnurledAmber,
    height: 18,
    width: 3.5,
  },
  auxBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E5EBE8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  auxBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#135461',
  },
});
