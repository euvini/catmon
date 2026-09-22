import React from 'react';
import { StyleSheet, View } from 'react-native';
import { RetroBadgePalettes } from '@/constants/colors';

export type BadgeFrameType = 'striped-circle' | 'striped-hexagon' | 'scalloped-flower';

interface RetroBadgeFrameProps {
  catId: string;
  size?: number;
  children: React.ReactNode;
  frameType?: BadgeFrameType;
  paletteIndex?: number;
}

function getDeterministicIndices(id: string): { type: BadgeFrameType; paletteIdx: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const types: BadgeFrameType[] = ['striped-circle', 'striped-hexagon', 'scalloped-flower'];
  const type = types[absHash % types.length];
  const paletteIdx = absHash % RetroBadgePalettes.length;

  return { type, paletteIdx };
}

export function RetroBadgeFrame({
  catId,
  size = 96,
  children,
  frameType,
  paletteIndex,
}: RetroBadgeFrameProps) {
  const deterministic = getDeterministicIndices(catId);
  const selectedType = frameType ?? deterministic.type;
  const selectedPalette =
    RetroBadgePalettes[
      paletteIndex !== undefined ? paletteIndex % RetroBadgePalettes.length : deterministic.paletteIdx
    ];

  const innerSize = Math.round(size * 0.72);
  const innerRadius = Math.round(innerSize / 2);

  // Renderizador de Moldura A: Círculo com Fatias/Listras Radiais Alternadas
  const renderStripedCircle = () => {
    // 8 barras cruzadas a cada 22.5 graus criam 16 listras perfeitas
    const angles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5];
    const barWidth = size;
    const barHeight = Math.max(3, Math.round(size * 0.12));

    return (
      <View
        style={[
          styles.outerCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: selectedPalette.secondary,
            borderColor: selectedPalette.border,
          },
        ]}
      >
        {/* Listras radiais */}
        {angles.map((angle) => (
          <View
            key={`stripe-${angle}`}
            style={[
              styles.radialBar,
              {
                width: barWidth,
                height: barHeight,
                backgroundColor: selectedPalette.primary,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        ))}

        {/* Borda interna branca de proteção */}
        <View
          style={[
            styles.innerRingWhite,
            {
              width: innerSize + 6,
              height: innerSize + 6,
              borderRadius: (innerSize + 6) / 2,
            },
          ]}
        />

        {/* Conteúdo (Foto do Gato) */}
        <View
          style={[
            styles.photoContainer,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerRadius,
            },
          ]}
        >
          {children}
        </View>
      </View>
    );
  };

  // Renderizador de Moldura B: Hexágono Listrado
  const renderStripedHexagon = () => {
    // Hexágono formado por 3 retângulos rotacionados a 0, 60 e 120 graus
    const hexAngles = [0, 60, 120];
    const rectWidth = size;
    const rectHeight = Math.round(size * 0.58);
    const rectRadius = Math.round(size * 0.08);

    const innerHexWidth = innerSize;
    const innerHexHeight = Math.round(innerSize * 0.58);
    const innerHexRadius = Math.round(innerSize * 0.08);

    return (
      <View style={[styles.centerContainer, { width: size, height: size }]}>
        {/* Camada Base do Hexágono com cor secundária */}
        {hexAngles.map((angle) => (
          <View
            key={`hex-bg-${angle}`}
            style={[
              styles.hexLayer,
              {
                width: rectWidth,
                height: rectHeight,
                borderRadius: rectRadius,
                backgroundColor: selectedPalette.secondary,
                borderWidth: 1.5,
                borderColor: selectedPalette.border,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        ))}

        {/* Listras diagonais de realce */}
        {[-30, 30].map((angle) => (
          <View
            key={`hex-stripe-${angle}`}
            style={[
              styles.radialBar,
              {
                width: size * 0.95,
                height: Math.round(size * 0.16),
                backgroundColor: selectedPalette.primary,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        ))}

        {/* Hexágono branco intermediário */}
        {hexAngles.map((angle) => (
          <View
            key={`hex-mid-${angle}`}
            style={[
              styles.hexLayer,
              {
                width: innerHexWidth + 8,
                height: innerHexHeight + 8,
                borderRadius: innerHexRadius,
                backgroundColor: '#FFFFFF',
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        ))}

        {/* Foto central circular/hexagonal recortada */}
        <View
          style={[
            styles.photoContainer,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerRadius,
              borderWidth: 2,
              borderColor: '#FFFFFF',
            },
          ]}
        >
          {children}
        </View>
      </View>
    );
  };

  // Renderizador de Moldura C: Flor/Roseta com Pétalas Onduladas
  const renderScallopedFlower = () => {
    // 8 pétalas circulares distribuídas radialmente ao redor do perímetro
    const petalCount = 8;
    const petalRadius = Math.round(size * 0.22);
    const orbitDistance = (size - petalRadius * 2) / 2;

    const petals = Array.from({ length: petalCount }, (_, i) => {
      const angle = (i * 2 * Math.PI) / petalCount;
      const x = Math.round(orbitDistance * Math.cos(angle));
      const y = Math.round(orbitDistance * Math.sin(angle));
      return { x, y, key: `petal-${i}` };
    });

    return (
      <View style={[styles.centerContainer, { width: size, height: size }]}>
        {/* Pétalas externas */}
        {petals.map((p) => (
          <View
            key={p.key}
            style={[
              styles.petal,
              {
                width: petalRadius * 2,
                height: petalRadius * 2,
                borderRadius: petalRadius,
                backgroundColor: selectedPalette.primary,
                borderWidth: 1,
                borderColor: selectedPalette.border,
                transform: [{ translateX: p.x }, { translateY: p.y }],
              },
            ]}
          />
        ))}

        {/* Fundo do miolo da flor */}
        <View
          style={[
            styles.innerRingWhite,
            {
              width: innerSize + 8,
              height: innerSize + 8,
              borderRadius: (innerSize + 8) / 2,
              backgroundColor: selectedPalette.secondary,
              borderWidth: 1.5,
              borderColor: '#FFFFFF',
            },
          ]}
        />

        {/* Foto central */}
        <View
          style={[
            styles.photoContainer,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerRadius,
              borderWidth: 2,
              borderColor: '#FFFFFF',
            },
          ]}
        >
          {children}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.badgeRoot, { width: size, height: size }]}>
      {selectedType === 'striped-circle' && renderStripedCircle()}
      {selectedType === 'striped-hexagon' && renderStripedHexagon()}
      {selectedType === 'scalloped-flower' && renderScallopedFlower()}
    </View>
  );
}

const styles = StyleSheet.create({
  badgeRoot: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    position: 'relative',
  },
  radialBar: {
    position: 'absolute',
    borderRadius: 2,
  },
  hexLayer: {
    position: 'absolute',
  },
  petal: {
    position: 'absolute',
  },
  innerRingWhite: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },
  photoContainer: {
    overflow: 'hidden',
    backgroundColor: '#ECEBE4',
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
