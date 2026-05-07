/**
 * Propósito: Componente que compara el rendimiento financiero entre el mes actual y el anterior.
 * Ubicación: src/components/ComparacionMensualCard.tsx
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  actual: number;
  anterior: number;
  titulo: string;
  tipo: 'gasto' | 'ahorro';
}

const ComparacionMensualCard: React.FC<Props> = ({ actual, anterior, titulo, tipo }) => {
  const diferencia = actual - anterior;
  const porcentaje = (Math.abs(diferencia) / anterior) * 100;
  
  // Lógica de éxito: 
  // - Gasto: actual < anterior (diferencia negativa) es BUENO.
  // - Ahorro: actual > anterior (diferencia positiva) es BUENO.
  const esExito = tipo === 'gasto' ? actual < anterior : actual > anterior;
  const color = esExito ? '#52B788' : '#791F1F'; // Esmeralda vs Rojo suave
  const icon = tipo === 'gasto' 
    ? (actual < anterior ? 'arrow-down' : 'arrow-up')
    : (actual > anterior ? 'arrow-up' : 'arrow-down');

  const formatCurrency = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(monto);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.montoActual}>{formatCurrency(actual)}</Text>
          <Text style={styles.montoAnterior}>vs {formatCurrency(anterior)} mes ant.</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={16} color={color} />
          <Text style={[styles.porcentaje, { color }]}>
            {porcentaje.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titulo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  montoActual: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  montoAnterior: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  porcentaje: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
});

export default ComparacionMensualCard;
