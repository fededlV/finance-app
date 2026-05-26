/**
 * Propósito: Pantalla principal adaptada a Expo Router.
 * Ubicación: app/(tabs)/index.tsx
 */

import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SaldoCard from '../../src/components/features/SaldoCard';
import TransaccionItem from '../../src/components/ui/TransaccionItem';
import { useDashboard } from '../../src/hooks/useDashboard';
import { api } from '../../src/services/api';

// ✅ Componente separado, fuera de HomeScreen
function ListHeader({ balance }: { balance: { total: number; ingresos: number; egresos: number; ahorros: number } }) {
  const router = useRouter();
  
  return (
    <View className="px-5 py-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-zinc-500 text-base">
          Hola, Fede 👋
        </Text>
        <Pressable 
          onPress={() => router.push('/agregar-transaccion')}
          className="bg-[#2D6A4F] px-4 py-2 rounded-xl active:opacity-80"
        >
          <Text className="text-white font-bold text-sm">+ Nuevo</Text>
        </Pressable>
      </View>
      
      <SaldoCard titulo="Saldo Total" monto={balance.total} tipo="principal" />

      <View className="flex-row justify-between">
        <SaldoCard 
          titulo="Ingresos" 
          monto={balance.ingresos} 
          color="#27500A"
          onPress={() => router.push({ pathname: '/gastos', params: { tipo: 'ingreso' } })}
        />
        <SaldoCard titulo="Egresos" monto={balance.egresos} color="#791F1F" />
      </View>

      <SaldoCard titulo="Ahorros" monto={balance.ahorros} color="#185FA5" />

      <View className="flex-row justify-between items-center mt-6 mb-3">
        <Text className="text-white text-xl font-bold">
          Últimas Transacciones
        </Text>
        <Pressable 
          onPress={() => router.push('/gastos')}
          className="active:opacity-70"
        >
          <Text className="text-[#2D6A4F] text-sm font-semibold">Ver todo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function InicializarPeriodoForm({ 
  periodoId, 
  mes, 
  anio, 
  onComplete 
}: { 
  periodoId: number; 
  mes: number; 
  anio: number; 
  onComplete: () => void 
}) {
  const [dineroInicial, setDineroInicial] = useState('');
  const [tipoCambioUsd, setTipoCambioUsd] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setValidationError(null);
    const monto = Number(dineroInicial.trim());
    if (!dineroInicial.trim() || isNaN(monto) || monto < 0) {
      setValidationError('Por favor ingresa un monto inicial válido (mayor o igual a 0).');
      return;
    }

    const tc = tipoCambioUsd.trim() ? Number(tipoCambioUsd.trim()) : null;
    if (tc !== null && (isNaN(tc) || tc <= 0)) {
      setValidationError('Por favor ingresa un tipo de cambio de USD válido (mayor a 0).');
      return;
    }

    setIsSubmitting(true);
    try {
      if (periodoId === 0) {
        await api.crearPeriodo({
          mes,
          anio,
          dinero_inicial: monto,
          tipo_cambio_usd: tc
        });
      } else {
        await api.actualizarPeriodo(periodoId, {
          dinero_inicial: monto,
          tipo_cambio_usd: tc
        });
      }
      onComplete();
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'Error al inicializar el período.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nombreMes = MESES[mes - 1] || 'Mes';

  return (
    <SafeAreaView className="flex-1 bg-black justify-center px-6" edges={['top']}>
      <View className="bg-zinc-950 border border-zinc-900 p-8 rounded-[32px] shadow-2xl">
        <View className="items-center mb-6">
          <View className="w-16 h-16 bg-[#2D6A4F]/20 rounded-full items-center justify-center mb-4">
            <Ionicons name="wallet-outline" size={32} color="#2D6A4F" />
          </View>
          <Text className="text-white text-3xl font-extrabold text-center">
            Configurar Período
          </Text>
          <Text className="text-zinc-500 text-sm mt-2 text-center">
            Comienza el mes de {nombreMes} {anio} ingresando tus fondos iniciales.
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-zinc-400 text-sm font-semibold mb-2 ml-1">
              Dinero Inicial (ARS) *
            </Text>
            <TextInput
              className="bg-zinc-900 text-white p-4 rounded-2xl text-lg border border-zinc-800 focus:border-[#2D6A4F]"
              placeholder="Ej. 500000"
              placeholderTextColor="#52525b"
              keyboardType="numeric"
              value={dineroInicial}
              onChangeText={setDineroInicial}
            />
          </View>

          <View>
            <Text className="text-zinc-400 text-sm font-semibold mb-2 ml-1">
              Tipo de Cambio USD (Opcional)
            </Text>
            <TextInput
              className="bg-zinc-900 text-white p-4 rounded-2xl text-lg border border-zinc-800 focus:border-[#2D6A4F]"
              placeholder="Ej. 1200"
              placeholderTextColor="#52525b"
              keyboardType="numeric"
              value={tipoCambioUsd}
              onChangeText={setTipoCambioUsd}
            />
          </View>

          {validationError && (
            <Text className="text-red-500 text-sm font-semibold text-center mt-2 px-2">
              {validationError}
            </Text>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl items-center justify-center shadow-lg mt-4 ${
              isSubmitting ? 'bg-zinc-800' : 'bg-[#2D6A4F]'
            }`}
          >
            <Text className="text-white text-base font-bold">
              {isSubmitting ? 'Guardando...' : 'Iniciar Período'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  const { isLoading, error, balance, periodo, ultimasTransacciones, refetch } = useDashboard();

  if (isLoading && ultimasTransacciones.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center" edges={['top']}>
        <ActivityIndicator size="large" color="#2D6A4F" />
        <Text className="text-zinc-400 mt-4 text-base font-semibold">Cargando finanzas...</Text>
      </SafeAreaView>
    );
  }

  if (periodo && periodo.dinero_inicial === 0) {
    return (
      <InicializarPeriodoForm
        periodoId={periodo.id}
        mes={periodo.mes}
        anio={periodo.anio}
        onComplete={refetch}
      />
    );
  }

  if (error && ultimasTransacciones.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center px-6" edges={['top']}>
        <View className="bg-zinc-900 border border-red-900/50 p-6 rounded-3xl items-center w-full max-w-sm shadow-xl">
          <View className="w-12 h-12 bg-red-950/50 rounded-full items-center justify-center mb-4">
            <Text className="text-red-500 text-2xl font-bold">⚠️</Text>
          </View>
          <Text className="text-white text-lg font-bold text-center mb-2">Error de conexión</Text>
          <Text className="text-zinc-400 text-sm text-center mb-6">{error}</Text>
          <Pressable 
            onPress={refetch}
            className="bg-red-900 px-6 py-3 rounded-2xl active:bg-red-800 w-full items-center"
          >
            <Text className="text-white font-bold text-base">Reintentar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FlatList
        data={ultimasTransacciones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransaccionItem transaccion={item} />}
        ListHeaderComponent={<ListHeader balance={balance} />}
        ListFooterComponent={<View className="h-24" />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        windowSize={5}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}
