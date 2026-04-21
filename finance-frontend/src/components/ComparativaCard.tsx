import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    color: '#8A8A9A',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  valueBlock: {
    flex: 1,
  },
  valueLabel: {
    color: '#8A8A9A',
    fontSize: 12,
    marginBottom: 4,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  delta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  arrow: {
    fontSize: 20,
    fontWeight: '700',
  },
});

interface ComparativaCardProps {
  title: string;
  actual: number;
  previous: number | null;
  variationPct: number | null;
  betterWhenHigher?: boolean;
}

export function ComparativaCard({
  title,
  actual,
  previous,
  variationPct,
  betterWhenHigher = false,
}: ComparativaCardProps) {
  const positiveChange = (variationPct ?? 0) >= 0;
  const improved = betterWhenHigher ? positiveChange : !positiveChange;
  const color = improved ? '#00C896' : '#FF4D6D';
  const arrow = positiveChange ? '▲' : '▼';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <View style={styles.valueBlock}>
          <Text style={styles.valueLabel}>Actual</Text>
          <Text style={styles.value}>$ {actual.toFixed(2)}</Text>
        </View>
        <Text style={[styles.arrow, { color }]}>{arrow}</Text>
        <View style={styles.valueBlock}>
          <Text style={styles.valueLabel}>Anterior</Text>
          <Text style={styles.value}>$ {(previous ?? 0).toFixed(2)}</Text>
        </View>
      </View>
      <Text style={[styles.delta, { color, marginTop: 12 }]}>
        {variationPct == null ? 'Sin comparación' : `${variationPct >= 0 ? '+' : ''}${variationPct.toFixed(1)}%`}
      </Text>
    </View>
  );
}
