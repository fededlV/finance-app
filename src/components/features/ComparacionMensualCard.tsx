/**
 * Propósito: Componente que compara el rendimiento financiero entre el mes actual y el anterior.
 * Ubicación: src/components/features/ComparacionMensualCard.tsx
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  actual: number;
  anterior: number;
  titulo: string;
  tipo: 'gasto' | 'ahorro';
}

const ComparacionMensualCard: React.FC<Props> = ({ actual, anterior, titulo, tipo }) => {
  const diferencia = actual - anterior;
  const porcentaje = anterior > 0 ? (Math.abs(diferencia) / anterior) * 100 : 0;
  
  const esExito = tipo === 'gasto' ? actual < anterior : actual > anterior;
  const color = esExito ? '#52B788' : '#791F1F';
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
    <View className="bg-white dark:bg-zinc-900 p-4 rounded-[24px] mb-4 border border-gray-100 dark:border-zinc-800 shadow-sm">
      <Text className="text-[10px] text-gray-500 dark:text-zinc-500 font-bold uppercase mb-2 tracking-wider">
        {titulo}
      </Text>
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(actual)}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
            vs {formatCurrency(anterior)} mes ant.
          </Text>
        </View>
        <View 
          className="flex-row items-center px-3 py-1.5 rounded-xl"
          style={{ backgroundColor: color + '15' }}
        >
          <Ionicons name={icon as any} size={14} color={color} />
          <Text style={{ color }} className="text-sm font-bold ml-1.5">
            {porcentaje.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ComparacionMensualCard;
