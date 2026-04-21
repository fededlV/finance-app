import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    overflow: 'hidden',
    backgroundColor: '#2A2A3A',
    borderColor: '#3A3A4A',
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    color: '#8A8A9A',
    marginBottom: 8,
    fontWeight: '500',
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00C896',
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00C896',
    marginLeft: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

interface SaldoCardProps {
  saldoDisponible: number;
}

export function SaldoCard({ saldoDisponible }: SaldoCardProps) {
  const formattedAmount = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(saldoDisponible);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Saldo Disponible</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>${formattedAmount}</Text>
        <Text style={styles.currency}>ARS</Text>
      </View>
    </View>
  );
}
