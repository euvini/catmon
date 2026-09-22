import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, useIsFocused } from 'expo-router';
import { CameraCaptureView } from '@/components/capture/camera-view';
import { CatFormModal } from '@/components/capture/cat-form-modal';
import { StickerReveal } from '@/components/animated/sticker-reveal';
import { LocationService } from '@/services/location';
import { MediaService } from '@/services/media';
import { CatRepository } from '@/database/cat-repository';
import { CatContext, CatTemperament, ApproxAge, GeoCoordinates } from '@/types/domain';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function CaptureScreen() {
  const router = useRouter();
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoCoordinates>({
    latitude: -23.55052,
    longitude: -46.633308,
    isObfuscated: false,
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isRevealVisible, setIsRevealVisible] = useState(false);
  const [savedCatName, setSavedCatName] = useState('Gato Misterioso');

  const handlePhotoCaptured = async (tempUri: string) => {
    setCapturedPhotoUri(tempUri);

    // Obtém localização em paralelo
    const loc = await LocationService.getCurrentLocation();
    setLocation(loc);

    setIsFormVisible(true);
  };

  const handleSaveCat = async (data: {
    name: string;
    breed: string;
    context: CatContext;
    color: string;
    temperament: CatTemperament;
    approxAge: ApproxAge;
    notes?: string;
  }) => {
    if (!capturedPhotoUri) return;

    try {
      const catId = generateUUID();

      // Salva permanentemente no sandbox do app
      const permanentUri = await MediaService.persistPhoto(capturedPhotoUri, catId);

      const isObfuscated = data.context === 'friend_pet';

      // Persiste no SQLite via Drizzle ORM
      await CatRepository.create({
        id: catId,
        name: data.name,
        breed: data.breed,
        context: data.context,
        color: data.color,
        temperament: data.temperament,
        approxAge: data.approxAge,
        latitude: location.latitude,
        longitude: location.longitude,
        isObfuscated,
        localPhotoUri: permanentUri,
        localThumbnailUri: permanentUri,
        remotePhotoUrl: null,
        notes: data.notes ?? null,
        isSynced: false,
      });

      setSavedCatName(data.name);
      setIsFormVisible(false);
      setIsRevealVisible(true);
    } catch {
      // Falha tratada
      setIsFormVisible(false);
    }
  };

  const handleDismissReveal = () => {
    setIsRevealVisible(false);
    setCapturedPhotoUri(null);
    router.navigate('/');
  };

  const isFocused = useIsFocused();
  const isCameraActive = isFocused && !isFormVisible && !isRevealVisible;

  return (
    <View style={styles.container}>
      <CameraCaptureView
        isActive={isCameraActive}
        onPhotoCaptured={handlePhotoCaptured}
        onClose={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.navigate('/');
          }
        }}
      />

      <CatFormModal
        visible={isFormVisible}
        photoUri={capturedPhotoUri}
        location={location}
        onClose={() => {
          setIsFormVisible(false);
          setCapturedPhotoUri(null);
        }}
        onSave={handleSaveCat}
      />

      <StickerReveal
        visible={isRevealVisible}
        photoUri={capturedPhotoUri}
        catName={savedCatName}
        onDismiss={handleDismissReveal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
