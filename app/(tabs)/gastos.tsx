/**
 * Propósito: Listado de transacciones adaptado a Expo Router.
 * Ubicación: app/(tabs)/gastos.tsx
 */

import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TransaccionItem from '../../src/components/ui/TransaccionItem';
import CategoriaChip from '../../src/components/ui/CategoriaChip';
import { CATEGORIAS } from '../../src/mocks/data';
import { useFinanceStore } from '../../src/store/useFinanceStore';

export default function GastosScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const tipoFiltro = params.tipo || 'gasto';
  
  const transacciones = useFinanceStore(state => state.transacciones);
  const deleteTransaccion = useFinanceStore(state => state.deleteTransaccion);
  
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  const data = transacciones.filter(t => t.tipo === tipoFiltro);
  const filteredData = categoriaSeleccionada 
    ? data.filter(g => g.categoria === categoriaSeleccionada)
    : data;

  const confirmDelete = (id: string) => {
    Alert.alert('Eliminar registro', '¿Estás seguro de que querés eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteTransaccion(id) }
    ]);
  };

  const title = tipoFiltro === 'ingreso' ? 'Todos los Ingresos' : 'Todos los Gastos';

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      <View className="flex-row items-center p-5 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800">
        {params.tipo && (
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} className="text-gray-900 dark:text-white" />
          </TouchableOpacity>
        )}
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">{title}</Text>
      </View>

      <View className="bg-white dark:bg-black py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <CategoriaChip 
            label="Todos" 
            activo={categoriaSeleccionada === null} 
            onPress={() => setCategoriaSeleccionada(null)} 
          />
          {CATEGORIAS.map(cat => (
            <CategoriaChip 
              key={cat.id}
              label={cat.nombre} 
              activo={categoriaSeleccionada === cat.id} 
              onPress={() => setCategoriaSeleccionada(cat.id)} 
            />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/nueva-transaccion', params: { id: item.id } })}
            onLongPress={() => confirmDelete(item.id)}
          >
            <TransaccionItem transaccion={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-gray-400 text-base">No hay registros en esta categoría.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
