/**
 * Propósito: Formulario para registrar nuevas transacciones conectado al store global.
 * Ubicación: src/screens/NuevaTransaccionScreen.tsx
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIAS } from '../mocks/data';
import { TipoTransaccion } from '../types';
import { useFinanceStore } from '../store/useFinanceStore';

const NuevaTransaccionScreen = ({ navigation }: any) => {
  const addTransaccion = useFinanceStore(state => state.addTransaccion);

  const [tipo, setTipo] = useState<TipoTransaccion>('gasto');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0].id);

  const handleGuardar = () => {
    const montoNum = parseFloat(monto);

    if (!monto || isNaN(montoNum) || montoNum <= 0 || !descripcion) {
      Alert.alert('Error', 'Por favor completa un monto válido y una descripción.');
      return;
    }
    
    // Creamos el objeto de transacción
    const nuevaTransaccion = {
      id: Math.random().toString(36).substring(7), // ID temporal único
      tipo,
      categoria,
      descripcion,
      monto: montoNum,
      fecha: new Date().toISOString().split('T')[0], // Fecha de hoy YYYY-MM-DD
    };

    // Guardamos en el store global (en memoria)
    addTransaccion(nuevaTransaccion);

    Alert.alert('Éxito', 'Transacción guardada correctamente', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={28} className="text-gray-900 dark:text-white" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Nueva Transacción</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Selector de Tipo */}
          <View className="flex-row bg-gray-100 dark:bg-zinc-900 rounded-xl p-1 mb-6">
            {(['ingreso', 'gasto', 'ahorro'] as TipoTransaccion[]).map((t) => (
              <TouchableOpacity 
                key={t}
                className={`flex-1 py-3 items-center rounded-lg ${tipo === t ? 'bg-white dark:bg-zinc-800 shadow-sm' : ''}`}
                onPress={() => setTipo(t)}
              >
                <Text className={`text-xs font-bold uppercase ${tipo === t ? 'text-[#2D6A4F]' : 'text-gray-400'}`}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-5">
            <Text className="text-gray-500 dark:text-zinc-400 text-sm font-semibold mb-2">Monto (ARS)</Text>
            <TextInput
              className="text-4xl font-bold text-gray-900 dark:text-white border-b-2 border-gray-100 dark:border-zinc-800 py-2"
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={monto}
              onChangeText={setMonto}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-500 dark:text-zinc-400 text-sm font-semibold mb-2">Descripción</Text>
            <TextInput
              className="text-base text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 py-2"
              placeholder="Ej: Compra supermercado"
              placeholderTextColor="#999"
              maxLength={80}
              value={descripcion}
              onChangeText={setDescripcion}
            />
          </View>

          <Text className="text-gray-500 dark:text-zinc-400 text-sm font-semibold mb-4">Categoría</Text>
          <View className="flex-row flex-wrap justify-between mb-8">
            {CATEGORIAS.map((cat) => (
              <TouchableOpacity 
                key={cat.id}
                className={`w-[30%] aspect-square rounded-2xl justify-center items-center mb-3 border ${
                  categoria === cat.id 
                    ? 'bg-[#2D6A4F] border-[#2D6A4F]' 
                    : 'bg-gray-50 dark:bg-zinc-900 border-gray-100 dark:border-zinc-800'
                }`}
                onPress={() => setCategoria(cat.id)}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={24} 
                  color={categoria === cat.id ? '#FFF' : '#666'} 
                />
                <Text className={`text-[10px] mt-1 ${categoria === cat.id ? 'text-white' : 'text-gray-500'}`}>
                  {cat.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            className="bg-[#2D6A4F] py-4 rounded-xl items-center mb-3 shadow-md" 
            onPress={handleGuardar}
          >
            <Text className="text-white text-base font-bold">GUARDAR TRANSACCIÓN</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="py-4 rounded-xl items-center border border-gray-200 dark:border-zinc-800" 
            onPress={() => navigation.goBack()}
          >
            <Text className="text-gray-500 dark:text-zinc-400 text-base font-semibold">CANCELAR</Text>
          </TouchableOpacity>

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NuevaTransaccionScreen;
