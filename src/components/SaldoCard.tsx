/**
 * Propósito: Tarjeta de resumen de saldo con variantes para Ingresos, Egresos y Ahorros.
 * Soporta modo claro/oscuro dinámico.
 */

import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  titulo: string;
  monto: number;
  tipo?: 'principal' | 'secundario';
  color?: string;
}

const SaldoCard: React.FC<Props> = ({ titulo, monto, tipo = 'secundario', color = '#2D6A4F' }) => {
  const formatMonto = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(val);
  };

  if (tipo === 'principal') {
    return (
      <View className="bg-[#2D6A4F] p-6 rounded-[24px] mb-4 shadow-md">
        <Text className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">
          {titulo}
        </Text>
        <Text className="text-white text-3xl font-bold">
          {formatMonto(monto)}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 dark:bg-zinc-900 p-4 rounded-[24px] mx-1 mb-4 shadow-sm border border-gray-200 dark:border-zinc-800">
      <Text className="text-gray-500 dark:text-zinc-400 text-[10px] font-bold uppercase mb-1">
        {titulo}
      </Text>
      <Text style={{ color }} className="text-lg font-bold">
        {formatMonto(monto)}
      </Text>
    </View>
  );
};

export default SaldoCard;
