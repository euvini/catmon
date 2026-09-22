import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CatColors } from '@/constants/colors';

interface PermissionModalProps {
  visible: boolean;
  onGrant: () => void;
  onDismiss: () => void;
}

export function ProgressivePermissionModal({ visible, onGrant, onDismiss }: PermissionModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="camera" size={28} color={CatColors.primary} />
            </View>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F8F5' }]}>
              <Ionicons name="location" size={28} color="#117A65" />
            </View>
          </View>

          <Text style={styles.title}>Prepare-se para o Diário de Campo!</Text>
          <Text style={styles.description}>
            Para registrar e catalogar os gatos que você avistar com alta fidelidade, precisamos
            acessar sua câmera e localização geográfica.
          </Text>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
            <Text style={styles.featureText}>
              Fotos salvas com segurança no seu próprio celular.
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#2ECC71" />
            <Text style={styles.featureText}>
              Privacidade protegida com ofuscação de lares particulares.
            </Text>
          </View>

          <TouchableOpacity style={styles.confirmButton} onPress={onGrant}>
            <Text style={styles.confirmButtonText}>Continuar e Permitir</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissButtonText}>Agora não</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: CatColors.textDark,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: CatColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 13,
    color: CatColors.textDark,
    fontWeight: '500',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: CatColors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: CatColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dismissButton: {
    paddingVertical: 12,
    marginTop: 8,
  },
  dismissButtonText: {
    color: CatColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
