/**
 * Propósito: Renderizar una fila de transacción individual.
 * Soporta modo claro/oscuro dinámico.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaccion } from '../../types';
import { CATEGORIAS } from '../../mocks/data';
import { formatMoney } from '../../utils/currency';

interface Props {
  transaccion: Transaccion;
}

const TransaccionItem: React.FC<Props> = ({ transaccion }) => {
  const categoria = CATEGORIAS.find(c => c.id === transaccion.categoria) || CATEGORIAS[8];
  
  const getMontoColor = () => {
    switch (transaccion.tipo) {
      case 'ingreso': return '#27500A';
      case 'gasto': return '#791F1F';
      case 'ahorro': return '#185FA5';
      default: return '#333';
    }
  };

  const formatMonto = (monto: number) => {
    return formatMoney(monto, 'ARS');
  };

  return (
    <View className="flex-row items-center bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-[20px] mb-2 border border-gray-100 dark:border-zinc-800">
      <View className="w-11 h-11 rounded-full bg-gray-200 dark:bg-zinc-800 items-center justify-center">
        <Ionicons name={categoria.icon as any} size={22} color="#666" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-gray-900 dark:text-white font-semibold text-base" numberOfLines={1}>
          {transaccion.descripcion}
        </Text>
        <Text className="text-gray-500 dark:text-zinc-500 text-xs">
          {transaccion.fecha}
        </Text>
      </View>
      <View className="items-end">
        <Text style={{ color: getMontoColor() }} className="text-base font-bold">
          {transaccion.tipo === 'gasto' ? '-' : ''}{formatMonto(transaccion.monto)}
        </Text>
      </View>
    </View>
  );
};

export default TransaccionItem;
