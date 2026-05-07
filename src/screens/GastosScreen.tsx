/**
 * Propósito: Pantalla de listado completo de gastos conectada al store global.
 * Ubicación: src/screens/GastosScreen.tsx
 */

import React, { useState } from 'react';
import { View, Text, FlatList, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import TransaccionItem from '../components/TransaccionItem';
import CategoriaChip from '../components/CategoriaChip';
import { CATEGORIAS } from '../mocks/data';
import { useFinanceStore } from '../store/useFinanceStore';

const GastosScreen = () => {
  const transacciones = useFinanceStore(state => state.transacciones);
  const deleteTransaccion = useFinanceStore(state => state.deleteTransaccion);
  
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  const gastos = transacciones.filter(t => t.tipo === 'gasto');
  const gastosFiltrados = categoriaSeleccionada 
    ? gastos.filter(g => g.categoria === categoriaSeleccionada)
    : gastos;

  const confirmDelete = (id: string) => {
    Alert.alert('Eliminar gasto', '¿Estás seguro de que querés eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteTransaccion(id) }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="p-5 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">Todos los Gastos</Text>
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
        data={gastosFiltrados}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => confirmDelete(item.id)}>
            <TransaccionItem transaccion={item} />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-gray-400 text-base">No hay gastos en esta categoría.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default GastosScreen;
