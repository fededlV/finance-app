/**
 * Propósito: Pantalla principal adaptada a Expo Router.
 * Ubicación: app/(tabs)/index.tsx
 */

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import SaldoCard from '../../src/components/features/SaldoCard';
import TransaccionItem from '../../src/components/ui/TransaccionItem';
import { useDashboard } from '../../src/hooks/useDashboard';
import { api, NetworkError } from '../../src/services/api';
import { maskArgentineInput, parseArgentineToCents } from '../../src/utils/currency';

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
          onPress={() => router.push({ pathname: '/transacciones', params: { tipo: 'ingreso' } })}
        />
        <SaldoCard 
          titulo="Egresos" 
          monto={balance.egresos} 
          color="#791F1F" 
          onPress={() => router.push({ pathname: '/transacciones', params: { tipo: 'gasto' } })}
        />
      </View>

      <SaldoCard 
        titulo="Ahorros" 
        monto={balance.ahorros} 
        color="#185FA5" 
        onPress={() => router.push({ pathname: '/transacciones', params: { tipo: 'ahorro' } })}
      />

      <View className="flex-row justify-between items-center mt-6 mb-3">
        <Text className="text-white text-xl font-bold">
          Últimas Transacciones
        </Text>
        <Pressable 
          onPress={() => router.push('/transacciones')}
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
    const rawCents = parseArgentineToCents(dineroInicial.trim());
    if (!dineroInicial.trim() || isNaN(rawCents) || rawCents < 0) {
      setValidationError('Por favor ingresa un dinero inicial válido (mayor o igual a 0).');
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
          dinero_inicial: rawCents,
          tipo_cambio_usd: tc
        });
      } else {
        await api.actualizarPeriodo(periodoId, {
          dinero_inicial: rawCents,
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
              placeholder="Ej. 500.000,00"
              placeholderTextColor="#52525b"
              keyboardType="numeric"
              value={dineroInicial}
              onChangeText={(text) => setDineroInicial(maskArgentineInput(text))}
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
  const router = useRouter();
  const { isLoading, error, balance, periodo, ultimasTransacciones, refetch } = useDashboard();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

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
    const isNetworkError = error instanceof NetworkError;
    const iconName = isNetworkError ? 'cloud-offline-outline' : 'alert-circle-outline';
    const errorTitle = isNetworkError ? 'Sin Conexión' : 'Error del Sistema';
    const errorDesc = isNetworkError 
      ? 'No pudimos conectarnos al servidor. Por favor, verifica tu conexión de red.' 
      : 'Ocurrió un error al procesar la información. Vuelve a intentarlo en unos momentos.';

    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center px-6" edges={['top']}>
        <View className="bg-zinc-950 border border-zinc-900 p-8 rounded-[32px] items-center w-full max-w-sm shadow-2xl">
          <View className="w-16 h-16 bg-[#2D6A4F]/10 rounded-full items-center justify-center mb-6">
            <Ionicons name={iconName as any} size={32} color="#2D6A4F" />
          </View>
          <Text className="text-white text-xl font-bold text-center mb-2">
            {errorTitle}
          </Text>
          <Text className="text-zinc-500 text-sm text-center mb-8 px-2 leading-relaxed">
            {errorDesc}
          </Text>
          
          <Pressable 
            onPress={refetch}
            className="bg-[#2D6A4F] px-6 py-4 rounded-2xl active:opacity-90 w-full items-center shadow-lg"
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
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (item.id.startsWith('i-') && !item.id.startsWith('i-db-')) {
                Alert.alert('Información', 'El dinero inicial se edita configurando el período desde la pantalla de inicio.');
                return;
              }
              router.push({ pathname: '/editar-transaccion', params: { id: item.id } });
            }}
            className="active:opacity-75"
          >
            <TransaccionItem transaccion={item} />
          </Pressable>
        )}
        ListHeaderComponent={<ListHeader balance={balance} />}
        ListFooterComponent={<View className="h-24" />}
        ListEmptyComponent={
          <View className="items-center justify-center py-12 px-6">
            <View className="w-16 h-16 bg-[#2D6A4F]/10 rounded-full items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={28} color="#2D6A4F" />
            </View>
            <Text className="text-white text-lg font-bold text-center">
              No hay transacciones
            </Text>
            <Text className="text-zinc-500 text-sm text-center mt-2 max-w-xs leading-relaxed">
              Aún no has agregado movimientos a este período. Comienza presionando "+ Nuevo" arriba.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        windowSize={5}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}
