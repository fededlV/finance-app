/**
 * Propósito: Pantalla dedicada para la edición y actualización de transacciones existentes.
 * Estética: One UI / AMOLED Dark Mode.
 * Ubicación: app/editar-transaccion.tsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFinanceStore, getCategoriaIdByKey } from '../src/store/useFinanceStore';
import { TipoTransaccion } from '../src/types';
import { maskArgentineInput, parseArgentineToCents, formatArgentineNumber } from '../src/utils/currency';

export default function EditarTransaccionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const transacciones = useFinanceStore((state) => state.transacciones);
  const updateTransaccion = useFinanceStore((state) => state.updateTransaccion);
  const deleteTransaccion = useFinanceStore((state) => state.deleteTransaccion);

  // Buscar transacción
  const transaccion = useMemo(() => {
    return transacciones.find((t) => t.id === id);
  }, [transacciones, id]);

  // Estado del formulario
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState<TipoTransaccion>('gasto');
  const [categoria, setCategoria] = useState('comida');
  const [moneda, setMoneda] = useState<'ARS' | 'USD'>('ARS');
  const [origen, setOrigen] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar valores iniciales
  useEffect(() => {
    if (transaccion) {
      // If it's a USD saving, pre-populate with the original USD cents. Otherwise, normal cents.
      const displayCents = transaccion.tipo === 'ahorro' && transaccion.moneda === 'USD' && transaccion.montoOriginal !== undefined
        ? transaccion.montoOriginal
        : transaccion.monto;
      
      setMonto(formatArgentineNumber(displayCents));
      setDescripcion(transaccion.descripcion);
      setTipo(transaccion.tipo);
      setCategoria(transaccion.categoria);
      setMoneda(transaccion.moneda || 'ARS');
      setOrigen(transaccion.origen || '');
    }
  }, [transaccion]);

  if (!transaccion) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text className="text-zinc-400 mt-4 text-base font-semibold">Cargando transacción...</Text>
      </SafeAreaView>
    );
  }

  const handleGuardar = async () => {
    const rawCents = parseArgentineToCents(monto.trim());
    if (!monto.trim() || isNaN(rawCents) || rawCents <= 0) {
      Alert.alert('Monto inválido', 'Por favor ingresa un monto válido (mayor a cero).');
      return;
    }

    setIsSubmitting(true);

    try {
      let dataPayload: any = {
        descripcion: descripcion || (tipo.charAt(0).toUpperCase() + tipo.slice(1)),
        monto: rawCents,
        fecha: transaccion.fecha,
      };

      if (tipo === 'gasto') {
        dataPayload.categoria_id = getCategoriaIdByKey(categoria);
      } else if (tipo === 'ahorro') {
        dataPayload.moneda = moneda;
        if (origen.trim()) {
          dataPayload.origen = origen.trim();
        } else {
          dataPayload.origen = null;
        }
      }

      await updateTransaccion(transaccion.id, {
        tipo,
        data: dataPayload,
      });

      setIsSubmitting(false);
      router.back();
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert('Error', err instanceof Error ? err.message : 'Error al actualizar la transacción.');
    }
  };

  const handleEliminar = () => {
    Alert.alert('Eliminar registro', '¿Estás seguro de que querés eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setIsSubmitting(true);
          try {
            await deleteTransaccion(transaccion.id);
            setIsSubmitting(false);
            router.back();
          } catch (err) {
            setIsSubmitting(false);
            Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo eliminar la transacción.');
          }
        },
      },
    ]);
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
          <View className="px-6 pt-4 pb-8 flex-row justify-between items-center">
            <View>
              <Text className="text-white text-4xl font-bold tracking-tight">
                Editar Registro
              </Text>
              <Text className="text-zinc-500 text-lg mt-1">
                Modifica los detalles de tu operación
              </Text>
            </View>
            <Pressable
              onPress={handleEliminar}
              className="w-12 h-12 bg-red-950/20 border border-red-900/30 rounded-2xl items-center justify-center active:opacity-75"
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </Pressable>
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

            {tipo === 'ahorro' && (
              <View className="mt-4 space-y-4">
                <View>
                  <Text className="text-zinc-500 text-sm mb-2 ml-1">Moneda</Text>
                  <View className="flex-row bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
                    {(['ARS', 'USD'] as const).map((m) => {
                      const isActive = moneda === m;
                      return (
                        <Pressable
                          key={m}
                          onPress={() => setMoneda(m)}
                          className={`flex-1 py-3 rounded-xl items-center justify-center ${
                            isActive ? 'bg-[#185FA5]' : 'bg-transparent'
                          }`}
                        >
                          <Text 
                            className={`font-semibold ${
                              isActive ? 'text-white' : 'text-zinc-400'
                            }`}
                          >
                            {m}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                <View className="mt-4">
                  <Text className="text-zinc-500 text-sm mb-2 ml-1">Origen (Sueldo, Regalo, Aguinaldo, etc.)</Text>
                  <TextInput
                    className="bg-zinc-900 text-white p-4 rounded-2xl text-lg border border-zinc-800 focus:border-[#2D6A4F]"
                    placeholder="Ej. Sueldo, Regalo, Ahorro..."
                    placeholderTextColor="#52525b"
                    value={origen}
                    onChangeText={setOrigen}
                  />
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
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
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
