import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#8A8A9A',
    marginBottom: 8,
    fontWeight: '500',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  icon: {
    fontSize: 20,
    marginBottom: 8,
  },
});

interface ResumenChipProps {
  label: string;
  amount: number;
  icon: string;
  color: string;
}

export function ResumenChip({ label, amount, icon, color }: ResumenChipProps) {
  const formattedAmount = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.amount, { color }]}>${formattedAmount}</Text>
    </View>
  );
}
