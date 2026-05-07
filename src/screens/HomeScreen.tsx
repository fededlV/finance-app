/**
 * Propósito: Pantalla principal con optimización de rendimiento (FlatList + Selectores).
 * Ubicación: src/screens/HomeScreen.tsx
 */

import React, { useMemo } from 'react';
import { View, Text, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SaldoCard from '../components/SaldoCard';
import TransaccionItem from '../components/TransaccionItem';
import { useFinanceStore } from '../store/useFinanceStore';

const HomeScreen = ({ navigation }: any) => {
  // Selectores de Zustand para evitar re-renders innecesarios si cambian otras partes del estado
  const balance = useFinanceStore(state => state.getBalance());
  const ultimas = useFinanceStore(state => state.getUltimas5());

  // Memorizamos el Header para que FlatList no lo re-renderice sin sentido
  const ListHeader = useMemo(() => (
    <View style={{ padding: 20 }}>
      <Text className="text-gray-500 dark:text-zinc-500 text-base mb-4">
        Hola, Fede 👋
      </Text>
      
      <SaldoCard 
        titulo="Saldo Total" 
        monto={balance.total} 
        tipo="principal" 
      />

      <View className="flex-row justify-between">
        <SaldoCard 
          titulo="Ingresos" 
          monto={balance.ingresos} 
          color="#27500A"
        />
        <SaldoCard 
          titulo="Egresos" 
          monto={balance.egresos} 
          color="#791F1F"
        />
      </View>

      <SaldoCard 
        titulo="Ahorros" 
        monto={balance.ahorros} 
        color="#185FA5"
      />

      <View className="flex-row justify-between items-center mt-4 mb-3">
        <Text className="text-gray-900 dark:text-white text-lg font-bold">
          Últimas Transacciones
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Gastos')}>
          <Text className="text-[#2D6A4F] text-sm font-semibold">Ver todo</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [balance, navigation]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <FlatList
        data={ultimas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransaccionItem transaccion={item} />}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<View className="h-24" />}
        showsVerticalScrollIndicator={false}
        // Optimizaciones de FlatList
        initialNumToRender={5}
        windowSize={5}
      />

      <TouchableOpacity 
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#2D6A4F] justify-center items-center shadow-lg"
        onPress={() => navigation.navigate('Nueva')}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;
