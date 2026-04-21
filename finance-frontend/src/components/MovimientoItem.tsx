import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Gasto, Ahorro } from '../types/models';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: '#2A2A3A',
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#8A8A9A',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
  moneda: {
    fontSize: 12,
    color: '#8A8A9A',
    marginTop: 2,
  },
  icon: {
    fontSize: 20,
  },
});

interface MovimientoItemProps {
  movimiento: Gasto | Ahorro;
  tipo: 'gasto' | 'ahorro';
  iconoCategoria?: string;
}

export function MovimientoItem({
  movimiento,
  tipo,
  iconoCategoria = '💳',
}: MovimientoItemProps) {
  const isGasto = tipo === 'gasto';
  const moneda = 'moneda' in movimiento ? (movimiento as Ahorro).moneda : 'ARS';

  const color = isGasto ? '#FF4D6D' : '#00C896';
  const backgroundColor = isGasto ? 'rgba(255, 77, 109, 0.15)' : 'rgba(0, 200, 150, 0.15)';

  const fecha = useMemo(() => {
    const date = new Date(movimiento.fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [movimiento.fecha]);

  const formattedAmount = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(movimiento.monto);

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor }]}>
        <Text style={styles.icon}>{iconoCategoria}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.description}>{movimiento.descripcion}</Text>
        <Text style={styles.date}>{fecha}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color }]}>
          {isGasto ? '-' : '+'}${formattedAmount}
        </Text>
        <Text style={styles.moneda}>{moneda}</Text>
      </View>
    </View>
  );
}
