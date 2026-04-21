import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import type { ResumenGastoCategoria } from '../types/models';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    padding: 16,
  },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    color: '#8A8A9A',
    fontSize: 12,
    marginBottom: 2,
  },
  centerAmount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
});

interface GraficoTortaProps {
  categorias: ResumenGastoCategoria[];
  totalGastado?: number | null;
}

export function GraficoTorta({ categorias, totalGastado }: GraficoTortaProps) {
  const safeTotalGastado = totalGastado ?? 0;

  const pieData = useMemo(
    () =>
      categorias
        .filter((item) => item.monto > 0)
        .map((item, index) => ({
          value: item.monto,
          color: itemColor(index),
          text: '',
          label: item.categoria,
        })),
    [categorias],
  );

  return (
    <View style={styles.container}>
      <View style={styles.chartWrap}>
        <PieChart
          data={pieData}
          donut
          radius={95}
          innerRadius={60}
          textColor="#FFFFFF"
          focusOnPress
          centerLabelComponent={() => (
            <View style={styles.centerContent}>
              <Text style={styles.centerLabel}>Total gastado</Text>
              <Text style={styles.centerAmount}>$ {safeTotalGastado.toFixed(2)}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

function itemColor(index: number) {
  const palette = ['#00C896', '#4E8BFF', '#FFB84D', '#FF6B6B', '#A36CFF', '#33D6D6', '#F97316', '#F43F5E'];
  return palette[index % palette.length];
}
