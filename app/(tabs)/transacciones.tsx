/**
 * Propósito: Listado general de transacciones (Gastos, Ingresos, Ahorros) con filtros avanzados.
 * Ubicación: app/(tabs)/transacciones.tsx
 */

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ScrollView, Pressable, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import TransaccionItem from '../../src/components/ui/TransaccionItem';
import CategoriaChip from '../../src/components/ui/CategoriaChip';
import { CATEGORIAS } from '../../src/mocks/data';
import { useFinanceStore } from '../../src/store/useFinanceStore';
import { TipoTransaccion } from '../../src/types';
import { Periodo } from '../../src/types/finance';

export default function TransaccionesScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const transacciones = useFinanceStore(state => state.transacciones) ?? [];
  const deleteTransaccion = useFinanceStore(state => state.deleteTransaccion);
  const isLoading = useFinanceStore(state => state.isLoading);
  const fetchDatos = useFinanceStore(state => state.fetchDatos);
  const periodo = useFinanceStore(state => state.periodo);
  const periodos = useFinanceStore(state => state.periodos) ?? [];
  
  // Tab activa: 'gasto' | 'ingreso' | 'ahorro'
  const [activeTab, setActiveTab] = useState<TipoTransaccion>(
    (params.tipo as TipoTransaccion) || 'gasto'
  );
  
  // Filtros locales
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchDatos();
    }, [fetchDatos])
  );

  const data = transacciones.filter(t => t?.tipo === activeTab);
  
  // Combinar filtros
  let filteredData = data;

  if (searchQuery.trim()) {
    filteredData = filteredData.filter(t => 
      t.descripcion.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }

  if (activeTab === 'gasto' && categoriaSeleccionada) {
    filteredData = filteredData.filter(g => g?.categoria === categoriaSeleccionada);
  }

  if (fechaDesde.trim()) {
    filteredData = filteredData.filter(t => t.fecha >= fechaDesde.trim());
  }

  if (fechaHasta.trim()) {
    filteredData = filteredData.filter(t => t.fecha <= fechaHasta.trim());
  }

  const confirmDelete = (id: string) => {
    if (id.startsWith('i-') && !id.startsWith('i-db-')) {
      Alert.alert('Acción no permitida', 'No se puede eliminar la transacción virtual de dinero inicial.');
      return;
    }

    Alert.alert('Eliminar registro', '¿Estás seguro de que querés eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteTransaccion(id);
          } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo eliminar la transacción.');
          }
        } 
      }
    ]);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'ingreso': return 'Ingresos';
      case 'ahorro': return 'Ahorros';
      default: return 'Gastos';
    }
  };

  const getPeriodLabel = (p: Periodo) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[p.mes - 1]} ${p.anio}`;
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

      {/* Selector de Períodos */}
      {periodos && periodos.length > 0 && (
        <View className="bg-white dark:bg-black py-3 border-b border-gray-100 dark:border-zinc-900">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {periodos.map((p) => {
              const isSelected = periodo?.id === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => fetchDatos(p.id)}
                  className={`px-4 py-2 rounded-xl mr-2.5 border ${
                    isSelected
                      ? 'bg-[#2D6A4F] border-[#2D6A4F]'
                      : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <Text
                    className={`font-bold text-xs ${
                      isSelected ? 'text-white' : 'text-gray-600 dark:text-zinc-400'
                    }`}
                  >
                    {getPeriodLabel(p)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Buscador e Inputs de Fecha */}
      <View className="px-5 py-3 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-900 space-y-2">
        {/* Input de Búsqueda */}
        <View className="flex-row items-center bg-gray-100 dark:bg-zinc-900 px-3 py-2.5 rounded-2xl border border-gray-200/50 dark:border-zinc-800/80">
          <Ionicons name="search-outline" size={18} color="#71717a" />
          <TextInput
            placeholder="Buscar por descripción..."
            placeholderTextColor="#71717a"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-gray-900 dark:text-white text-sm"
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#71717a" />
            </Pressable>
          )}
        </View>

        {/* Inputs de Rango de Fechas */}
        <View className="flex-row justify-between items-center mt-2">
          <View className="w-[47%] flex-row items-center bg-gray-100 dark:bg-zinc-900 px-2.5 py-2 rounded-xl border border-gray-200/50 dark:border-zinc-800/80">
            <Ionicons name="calendar-outline" size={14} color="#71717a" style={{ marginRight: 4 }} />
            <TextInput
              placeholder="Desde: AAAA-MM-DD"
              placeholderTextColor="#71717a"
              value={fechaDesde}
              onChangeText={setFechaDesde}
              className="flex-1 text-gray-900 dark:text-white text-xs p-0"
            />
            {fechaDesde !== '' && (
              <Pressable onPress={() => setFechaDesde('')}>
                <Ionicons name="close-circle" size={14} color="#71717a" />
              </Pressable>
            )}
          </View>
          
          <Text className="text-gray-400 dark:text-zinc-600 text-xs">a</Text>

          <View className="w-[47%] flex-row items-center bg-gray-100 dark:bg-zinc-900 px-2.5 py-2 rounded-xl border border-gray-200/50 dark:border-zinc-800/80">
            <Ionicons name="calendar-outline" size={14} color="#71717a" style={{ marginRight: 4 }} />
            <TextInput
              placeholder="Hasta: AAAA-MM-DD"
              placeholderTextColor="#71717a"
              value={fechaHasta}
              onChangeText={setFechaHasta}
              className="flex-1 text-gray-900 dark:text-white text-xs p-0"
            />
            {fechaHasta !== '' && (
              <Pressable onPress={() => setFechaHasta('')}>
                <Ionicons name="close-circle" size={14} color="#71717a" />
              </Pressable>
            )}
          </View>
        </View>
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
      {isLoading && filteredData.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2D6A4F" />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Pressable 
              onPress={() => {
                if (item.id.startsWith('i-') && !item.id.startsWith('i-db-')) {
                  Alert.alert('Información', 'El dinero inicial se edita configurando el período desde la pantalla de inicio.');
                  return;
                }
                router.push({ pathname: '/editar-transaccion', params: { id: item.id } });
              }}
              onLongPress={() => confirmDelete(item.id)}
              className="active:opacity-70"
            >
              <TransaccionItem transaccion={item} />
            </Pressable>
          )}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-gray-400 dark:text-zinc-500 text-base">No hay registros en esta categoría.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
