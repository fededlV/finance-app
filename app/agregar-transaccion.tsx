/**
 * Propósito: Pantalla dedicada para el registro de nuevas transacciones.
 * Estética: One UI / AMOLED Dark Mode.
 * Ubicación: app/agregar-transaccion.tsx
 */

import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../src/store/useFinanceStore';
import { TipoTransaccion, Transaccion } from '../src/types';
import { CATEGORIAS } from '../src/mocks/data';
import { maskArgentineInput, parseArgentineToCents } from '../src/utils/currency';
import { api } from '../src/services/api';

export default function AgregarTransaccionScreen() {
  const router = useRouter();
  const addTransaccion = useFinanceStore((state) => state.addTransaccion);

  // Estado del formulario
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<TipoTransaccion>('gasto');
  const [categoria, setCategoria] = useState('comida');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selector de categoría por defecto según el tipo
  const categoriaDefault = useMemo(() => {
    if (tipo === 'ahorro') return 'ahorro';
    if (tipo === 'ingreso') return 'otro';
    return 'comida'; // Default para gasto
  }, [tipo]);

  const handleGuardar = async () => {
    const rawCents = parseArgentineToCents(monto.trim());
    if (!monto.trim() || isNaN(rawCents) || rawCents <= 0) {
      // Validación básica
      return;
    }

    setIsSubmitting(true);

    const nuevaTransaccion: Transaccion = {
      id: Math.random().toString(36).substring(2, 9),
      tipo,
      monto: rawCents,
      descripcion: descripcion || (tipo.charAt(0).toUpperCase() + tipo.slice(1)),
      categoria: tipo === 'gasto' ? categoria : categoriaDefault,
      fecha: new Date().toISOString().split('T')[0],
    };

    try {
      try {
        const currentPeriod = await api.getPeriodoActual();
        if (currentPeriod && currentPeriod.id > 0) {
          if (tipo === 'gasto') {
            await api.crearGasto({
              periodo_id: currentPeriod.id,
              categoria_id: getCategoriaIdByKey(categoria),
              descripcion: nuevaTransaccion.descripcion,
              monto: rawCents,
              fecha: nuevaTransaccion.fecha,
            });
          } else if (tipo === 'ahorro') {
            await api.crearAhorro({
              periodo_id: currentPeriod.id,
              descripcion: nuevaTransaccion.descripcion,
              monto: rawCents,
              moneda: 'ARS',
              fecha: nuevaTransaccion.fecha,
            });
          } else if (tipo === 'ingreso') {
            await api.crearIngreso({
              periodo_id: currentPeriod.id,
              descripcion: nuevaTransaccion.descripcion,
              monto: rawCents,
              fecha: nuevaTransaccion.fecha,
            });
          }
        }
      } catch (apiErr) {
        console.warn('API registry failed, fallback to local store:', apiErr);
      }

      // Almacenamiento local para consistencia/mock
      addTransaccion(nuevaTransaccion);
      setIsSubmitting(false);
      router.back();
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert('Error', err instanceof Error ? err.message : 'Error al registrar la transacción.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-6 pt-4 pb-8">
            <Text className="text-white text-4xl font-bold tracking-tight">
              Nuevo Registro
            </Text>
            <Text className="text-zinc-500 text-lg mt-1">
              Ingresa los detalles de tu operación
            </Text>
          </View>

          {/* Selector de Tipo */}
          <View className="px-6 mb-10">
            <View className="flex-row bg-zinc-900 p-1.5 rounded-2xl">
              {(['gasto', 'ingreso', 'ahorro'] as TipoTransaccion[]).map((t) => {
                const isActive = tipo === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTipo(t)}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${
                      isActive ? 'bg-[#2D6A4F]' : 'bg-transparent'
                    }`}
                  >
                    <Text 
                      className={`font-semibold capitalize ${
                        isActive ? 'text-white' : 'text-zinc-400'
                      }`}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Input de Monto */}
          <View className="px-6 items-center justify-center mb-12">
            <Text className="text-zinc-500 text-sm mb-2 uppercase font-bold tracking-widest">
              Monto
            </Text>
            <View className="flex-row items-center">
              <Text className="text-white text-5xl font-light mr-2">$</Text>
              <TextInput
                className="text-white text-6xl font-bold min-w-[150px] text-center"
                placeholder="0"
                placeholderTextColor="#27272a"
                keyboardType="numeric"
                value={monto}
                onChangeText={(text) => setMonto(maskArgentineInput(text))}
                autoFocus
              />
            </View>
          </View>

          {/* Campos Adicionales */}
          <View className="px-6 space-y-6">
            <View>
              <Text className="text-zinc-500 text-sm mb-2 ml-1">Descripción</Text>
              <TextInput
                className="bg-zinc-900 text-white p-4 rounded-2xl text-lg border border-zinc-800 focus:border-[#2D6A4F]"
                placeholder="Ej. Almuerzo, Sueldo, Ahorro mes..."
                placeholderTextColor="#52525b"
                value={descripcion}
                onChangeText={setDescripcion}
              />
            </View>

            {tipo === 'gasto' && (
              <View className="mt-4">
                <Text className="text-zinc-500 text-sm mb-3 ml-1">Categoría</Text>
                <View className="flex-row flex-wrap justify-between">
                  {[
                    { key: 'comida', label: 'Comida', icon: 'fast-food' },
                    { key: 'transporte', label: 'Transporte', icon: 'bus' },
                    { key: 'ocio', label: 'Entretenimiento', icon: 'game-controller' },
                    { key: 'salud', label: 'Salud', icon: 'medical' },
                    { key: 'hogar', label: 'Servicios', icon: 'home' },
                    { key: 'otro', label: 'Otros', icon: 'add-circle' },
                  ].map((cat) => {
                    const isSelected = categoria === cat.key;
                    return (
                      <Pressable
                        key={cat.key}
                        onPress={() => setCategoria(cat.key)}
                        className={`w-[48%] flex-row items-center p-3.5 rounded-2xl mb-3 border ${
                          isSelected 
                            ? 'bg-[#2D6A4F]/20 border-[#2D6A4F]' 
                            : 'bg-zinc-900 border-zinc-800'
                        }`}
                      >
                        <Ionicons 
                          name={cat.icon as any} 
                          size={20} 
                          color={isSelected ? '#2D6A4F' : '#a1a1aa'} 
                        />
                        <Text 
                          className={`ml-2 font-semibold text-sm ${
                            isSelected ? 'text-white' : 'text-zinc-400'
                          }`}
                        >
                          {cat.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          <View className="flex-1" />

          {/* Acciones */}
          <View className="px-6 py-8 space-y-4">
            <Pressable
              onPress={handleGuardar}
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl items-center justify-center shadow-lg ${
                isSubmitting ? 'bg-zinc-800' : 'bg-[#2D6A4F]'
              }`}
            >
              <Text className="text-white text-lg font-bold">
                {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              className="w-full py-4 rounded-2xl items-center justify-center border border-zinc-800 active:bg-zinc-900"
            >
              <Text className="text-zinc-400 text-lg font-semibold">
                Cancelar
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getCategoriaIdByKey(key: string): number {
  const mapping: Record<string, number> = {
    'comida': 1,
    'transporte': 2,
    'salud': 3,
    'ocio': 4,
    'hogar': 5,
    'educacion': 7,
    'otro': 8,
  };
  return mapping[key] || 8;
}
