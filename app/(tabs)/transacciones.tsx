/**
 * Propósito: Listado general de transacciones (Gastos, Ingresos, Ahorros) con filtros.
 * Ubicación: app/(tabs)/transacciones.tsx
 */

import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TransaccionItem from '../../src/components/ui/TransaccionItem';
import CategoriaChip from '../../src/components/ui/CategoriaChip';
import { CATEGORIAS } from '../../src/mocks/data';
import { useFinanceStore } from '../../src/store/useFinanceStore';
import { TipoTransaccion } from '../../src/types';

export default function TransaccionesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const transacciones = useFinanceStore(state => state.transacciones);
  const deleteTransaccion = useFinanceStore(state => state.deleteTransaccion);
  
  // Tab activa: 'gasto' | 'ingreso' | 'ahorro'
  const [activeTab, setActiveTab] = useState<TipoTransaccion>(
    (params.tipo as TipoTransaccion) || 'gasto'
  );
  
  // Filtro de categoría (solo aplica si activeTab === 'gasto')
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  const data = transacciones.filter(t => t.tipo === activeTab);
  const filteredData = (activeTab === 'gasto' && categoriaSeleccionada)
    ? data.filter(g => g.categoria === categoriaSeleccionada)
    : data;

  const confirmDelete = (id: string) => {
    Alert.alert('Eliminar registro', '¿Estás seguro de que querés eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteTransaccion(id) }
    ]);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'ingreso': return 'Ingresos';
      case 'ahorro': return 'Ahorros';
      default: return 'Gastos';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center p-5 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800">
        {params.tipo && (
          <Pressable onPress={() => router.back()} className="mr-3 active:opacity-75">
            <Ionicons name="arrow-back" size={24} className="text-gray-900 dark:text-white" />
          </Pressable>
        )}
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">{getTabTitle()}</Text>
      </View>

      {/* Tab Selector Segmentado */}
      <View className="px-5 pt-4 pb-2 bg-white dark:bg-black">
        <View className="flex-row bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl">
          {([
            { key: 'gasto', label: 'Gastos' },
            { key: 'ingreso', label: 'Ingresos' },
            { key: 'ahorro', label: 'Ahorros' }
          ] as const).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  setActiveTab(tab.key);
                  setCategoriaSeleccionada(null); // Resetear filtro de categoría
                }}
                className={`flex-1 py-3 rounded-xl items-center justify-center ${
                  isActive ? 'bg-[#2D6A4F]' : 'bg-transparent'
                }`}
              >
                <Text 
                  className={`font-semibold text-sm ${
                    isActive ? 'text-white' : 'text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Chips de Categorías (solo para Gastos) */}
      {activeTab === 'gasto' && (
        <View className="bg-white dark:bg-black py-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            <CategoriaChip 
              label="Todos" 
              activo={categoriaSeleccionada === null} 
              onPress={() => setCategoriaSeleccionada(null)} 
            />
            {CATEGORIAS.filter(cat => cat.id !== 'ahorro' && cat.id !== 'trabajo').map(cat => (
              <CategoriaChip 
                key={cat.id}
                label={cat.nombre} 
                activo={categoriaSeleccionada === cat.id} 
                onPress={() => setCategoriaSeleccionada(cat.id)} 
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Lista de Transacciones */}
      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable 
            onLongPress={() => confirmDelete(item.id)}
            className="active:opacity-70"
          >
            <TransaccionItem transaccion={item} />
          </Pressable>
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
