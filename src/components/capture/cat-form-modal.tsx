import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  CatContext,
  CatTemperament,
  ApproxAge,
  CoatPattern,
  GeoCoordinates,
} from '@/types/domain';
import { CatColors, TemperamentColors, ContextColors, CoatColors } from '@/constants/colors';

interface CatFormModalProps {
  visible: boolean;
  photoUri: string | null;
  location: GeoCoordinates;
  onClose: () => void;
  onSave: (data: {
    name: string;
    breed: string;
    context: CatContext;
    color: string;
    temperament: CatTemperament;
    approxAge: ApproxAge;
    notes?: string;
  }) => void;
}

export function CatFormModal({ visible, photoUri, location, onClose, onSave }: CatFormModalProps) {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('SRD');
  const [context, setContext] = useState<CatContext>('stray');
  const [coatPattern, setCoatPattern] = useState<CoatPattern>('tabby');
  const [temperament, setTemperament] = useState<CatTemperament>('friendly');
  const [approxAge, setApproxAge] = useState<ApproxAge>('adult');
  const [notes, setNotes] = useState('');

  const isFriendPet = context === 'friend_pet';

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const chosenColor = CoatColors[coatPattern]?.hex ?? '#F39C12';

    onSave({
      name: name.trim() || 'Gato Misterioso',
      breed: breed.trim() || 'SRD',
      context,
      color: chosenColor,
      temperament,
      approxAge,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={CatColors.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Colecionável</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveHeaderButton}>
            <Text style={styles.saveHeaderText}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Photo Preview Card */}
          {photoUri && (
            <View style={styles.previewCard}>
              <Image source={{ uri: photoUri }} style={styles.previewImage} contentFit="cover" />
              <View style={styles.previewBadge}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                <Text style={styles.previewBadgeText}>Sticker em Criação</Text>
              </View>
            </View>
          )}

          {/* Privacy Notice if Friend Pet */}
          {isFriendPet && (
            <View style={styles.privacyNotice}>
              <Ionicons name="shield-checkmark" size={20} color="#6C3483" />
              <Text style={styles.privacyNoticeText}>
                Proteção Ativa: A localização será ofuscada num raio de 150m-300m no mapa para resguardar a residência.
              </Text>
            </View>
          )}

          {/* Location Info */}
          <View style={styles.locationInfo}>
            <Ionicons name="location-sharp" size={16} color={CatColors.primary} />
            <Text style={styles.locationText}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              {isFriendPet && ' (será aproximada)'}
            </Text>
          </View>

          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome ou Apelido</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Mingau, Frajola, Tigrão..."
              placeholderTextColor="#A0AEC0"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Breed Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Raça Presumida</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: SRD, Siamês, Persa..."
              placeholderTextColor="#A0AEC0"
              value={breed}
              onChangeText={setBreed}
            />
          </View>

          {/* Coat Pattern Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pelagem / Cor Predominante</Text>
            <View style={styles.chipRow}>
              {(Object.keys(CoatColors) as CoatPattern[]).map((pattern) => {
                const isSelected = coatPattern === pattern;
                const config = CoatColors[pattern];
                return (
                  <TouchableOpacity
                    key={pattern}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelectedPrimary,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setCoatPattern(pattern);
                    }}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Context Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contexto do Encontro</Text>
            <View style={styles.chipRow}>
              {(Object.keys(ContextColors) as CatContext[]).map((ctx) => {
                const isSelected = context === ctx;
                const config = ContextColors[ctx];
                return (
                  <TouchableOpacity
                    key={ctx}
                    style={[
                      styles.chip,
                      isSelected && { backgroundColor: config.text, borderColor: config.text },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setContext(ctx);
                    }}
                  >
                    <Text style={[styles.chipText, isSelected && { color: '#FFFFFF', fontWeight: '700' }]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Temperament Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Temperamento Observado</Text>
            <View style={styles.chipRow}>
              {(Object.keys(TemperamentColors) as CatTemperament[]).map((temp) => {
                const isSelected = temperament === temp;
                const config = TemperamentColors[temp];
                return (
                  <TouchableOpacity
                    key={temp}
                    style={[
                      styles.chip,
                      isSelected && { backgroundColor: config.text, borderColor: config.text },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setTemperament(temp);
                    }}
                  >
                    <Text style={[styles.chipText, isSelected && { color: '#FFFFFF', fontWeight: '700' }]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Estimated Age */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Faixa Etária Presumida</Text>
            <View style={styles.chipRow}>
              {[
                { key: 'kitten', label: 'Filhote (<6m)' },
                { key: 'young', label: 'Jovem (6m-2a)' },
                { key: 'adult', label: 'Adulto (2a-8a)' },
                { key: 'senior', label: 'Idoso (8a+)' },
              ].map((age) => {
                const isSelected = approxAge === age.key;
                return (
                  <TouchableOpacity
                    key={age.key}
                    style={[styles.chip, isSelected && styles.chipSelectedPrimary]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setApproxAge(age.key as ApproxAge);
                    }}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {age.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Observações (Opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Ex: Muito carinhoso, comeu um sachê e depois tirou uma soneca..."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="gift" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Colecionar na Catdex</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: CatColors.textDark,
  },
  closeButton: {
    padding: 4,
  },
  saveHeaderButton: {
    padding: 4,
  },
  saveHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: CatColors.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  previewCard: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#E2E8F0',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4ECF7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  privacyNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#6C3483',
    lineHeight: 18,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    color: CatColors.textMuted,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: CatColors.textDark,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: CatColors.textDark,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipSelectedPrimary: {
    backgroundColor: CatColors.primary,
    borderColor: CatColors.primary,
  },
  chipText: {
    fontSize: 13,
    color: CatColors.textMuted,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: CatColors.primary,
    borderRadius: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: CatColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
