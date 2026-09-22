import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { CatRepository } from '@/database/cat-repository';
import { CatRecord } from '@/database/schema';
import { FlipCard } from '@/components/animated/flip-card';
import { useCatStore } from '@/stores/cat-store';
import { CatColors } from '@/constants/colors';

export default function CatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const deleteCat = useCatStore((s) => s.deleteCat);
  const [cat, setCat] = useState<CatRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    CatRepository.getById(id).then((result) => {
      setCat(result);
      setLoading(false);
    });
  }, [id]);

  const handleDelete = () => {
    if (!cat) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Alert.alert(
      'Remover Colecionável',
      `Tem certeza que deseja remover o adesivo de "${cat.name}" da sua Catdex?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await deleteCat(cat.id);
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={CatColors.primary} />
      </View>
    );
  }

  if (!cat) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={CatColors.textMuted} />
        <Text style={styles.errorText}>Adesivo não encontrado na Catdex.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: cat.name,
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={{ padding: 8 }}>
              <Ionicons name="trash-outline" size={22} color="#E74C3C" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* 3D Flip Card Component */}
      <FlipCard cat={cat} />

      {/* Action Footer */}
      <View style={styles.instructionContainer}>
        <Ionicons name="information-circle-outline" size={18} color={CatColors.textMuted} />
        <Text style={styles.instructionText}>
          Toque no card para alternar entre a arte do adesivo e a ficha técnica detalhada.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: CatColors.textMuted,
    marginVertical: 12,
  },
  backButton: {
    backgroundColor: CatColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginTop: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 400,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: CatColors.textMuted,
    lineHeight: 18,
  },
});
