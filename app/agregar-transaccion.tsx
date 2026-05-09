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
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore } from '../src/store/useFinanceStore';
import { TipoTransaccion, Transaccion } from '../src/types';
import { CATEGORIAS } from '../src/mocks/data';

export default function AgregarTransaccionScreen() {
  const router = useRouter();
  const addTransaccion = useFinanceStore((state) => state.addTransaccion);

  // Estado del formulario
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<TipoTransaccion>('gasto');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selector de categoría por defecto según el tipo
  const categoriaDefault = useMemo(() => {
    if (tipo === 'ahorro') return 'ahorro';
    if (tipo === 'ingreso') return 'otro';
    return 'comida'; // Default para gasto
  }, [tipo]);

  const handleGuardar = async () => {
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      // Validación básica
      return;
    }

    setIsSubmitting(true);

    const nuevaTransaccion: Transaccion = {
      id: Math.random().toString(36).substring(2, 9),
      tipo,
      monto: Number(monto),
      descripcion: descripcion || (tipo.charAt(0).toUpperCase() + tipo.slice(1)),
      categoria: categoriaDefault,
      fecha: new Date().toISOString().split('T')[0],
    };

    // Simulación de latencia de red (Regla de .clinerules)
    setTimeout(() => {
      addTransaccion(nuevaTransaccion);
      setIsSubmitting(false);
      router.back();
    }, 500);
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
                onChangeText={setMonto}
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
