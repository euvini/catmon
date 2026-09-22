import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatColors } from '@/constants/colors';

// Tipagem compatível com BottomTabBarProps do Expo Router
export interface GlassTabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  descriptors: Record<
    string,
    {
      options: {
        tabBarStyle?: object;
        title?: string;
      };
    }
  >;
  navigation: {
    navigate: (name: string, params?: object) => void;
    emit: (event: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
  };
}

export function GlassTabBar({ state, descriptors, navigation }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index];
  const currentOptions = descriptors[currentRoute.key]?.options;

  // Se a rota ativa solicitar ocultação da tab bar (como a tela de Câmera), não renderiza
  if (
    currentOptions?.tabBarStyle &&
    (currentOptions.tabBarStyle as { display?: string }).display === 'none'
  ) {
    return null;
  }

  const isMapActive = currentRoute.name === 'map';
  const isCollectionActive = currentRoute.name === 'index';

  const handleNavigate = (routeName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const targetRoute = state.routes.find((r) => r.name === routeName);
    if (!targetRoute) return;

    const event = navigation.emit({
      type: 'tabPress',
      target: targetRoute.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const handleOpenCapture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('capture');
  };

  const isNativeGlassSupported = (() => {
    try {
      return Platform.OS === 'ios' && typeof isLiquidGlassAvailable === 'function' && isLiquidGlassAvailable();
    } catch {
      return false;
    }
  })();

  const content = (
    <View style={styles.contentRow}>
      {/* Aba Map (Esquerda) */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleNavigate('map')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isMapActive ? 'map' : 'map-outline'}
          size={22}
          color={isMapActive ? CatColors.tabBarTeal : '#8A9BA8'}
        />
        <Text style={[styles.tabLabel, isMapActive && styles.tabLabelActive]}>
          Map
        </Text>
      </TouchableOpacity>

      {/* Botão Central de Captura (Teal Circular Elevado) */}
      <TouchableOpacity
        style={styles.captureButton}
        onPress={handleOpenCapture}
        activeOpacity={0.85}
      >
        <Ionicons name="camera" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Aba Catdex (Direita) */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => handleNavigate('index')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isCollectionActive ? 'paw' : 'paw-outline'}
          size={22}
          color={isCollectionActive ? CatColors.tabBarTeal : '#8A9BA8'}
        />
        <Text style={[styles.tabLabel, isCollectionActive && styles.tabLabelActive]}>
          Catdex
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View
      style={[
        styles.floatingContainer,
        { bottom: insets.bottom > 0 ? insets.bottom + 4 : 14 },
      ]}
      pointerEvents="box-none"
    >
      {isNativeGlassSupported ? (
        <GlassView
          glassEffectStyle="regular"
          colorScheme="light"
          style={styles.glassPill}
        >
          {content}
        </GlassView>
      ) : (
        <View style={[styles.glassPill, styles.fallbackPill]}>{content}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 28,
    right: 28,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  glassPill: {
    width: '100%',
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  fallbackPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A9BA8',
    marginTop: 2,
  },
  tabLabelActive: {
    color: CatColors.tabBarTeal,
    fontWeight: '800',
  },
  captureButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: CatColors.tabBarTeal,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: CatColors.tabBarTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
