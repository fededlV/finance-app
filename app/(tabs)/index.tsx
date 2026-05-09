/**
 * Propósito: Pantalla principal adaptada a Expo Router.
 * Ubicación: app/(tabs)/index.tsx
 */

import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/shallow';
import { useRouter } from 'expo-router';
import SaldoCard from '../../src/components/features/SaldoCard';
import TransaccionItem from '../../src/components/ui/TransaccionItem';
import { useFinanceStore, selectBalance, selectUltimas5 } from '../../src/store/useFinanceStore';

// ✅ Componente separado, fuera de HomeScreen
function ListHeader({ balance }: { balance: ReturnType<typeof selectBalance> }) {
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

export default function HomeScreen() {
  const balance = useFinanceStore(useShallow(selectBalance));
  const ultimas = useFinanceStore(useShallow(selectUltimas5));

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <FlatList
        data={ultimas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransaccionItem transaccion={item} />}
        ListHeaderComponent={<ListHeader balance={balance} />}
        ListFooterComponent={<View className="h-24" />}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        windowSize={5}
      />
    </SafeAreaView>
  );
}
