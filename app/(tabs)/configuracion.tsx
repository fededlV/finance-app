/**
 * Propósito: Configuración adaptada a Expo Router.
 * Ubicación: app/(tabs)/configuracion.tsx
 */

import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

export default function ConfiguracionScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesión', style: 'destructive', onPress: () => console.log('Logout placeholder') }
    ]);
  };

  const ThemeOption = ({ title, value, icon }: { title: string, value: 'light' | 'dark' | 'system', icon: any }) => {
    const isSelected = colorScheme === value;
    return (
      <TouchableOpacity 
        onPress={() => setColorScheme(value)}
        className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 border ${
          isSelected 
            ? 'bg-[#2D6A4F]/10 border-[#2D6A4F]' 
            : 'bg-gray-50 dark:bg-zinc-900 border-transparent'
        }`}
      >
        <View className="flex-row items-center">
          <View className={`w-10 h-10 rounded-full items-center justify-center ${isSelected ? 'bg-[#2D6A4F]' : 'bg-gray-200 dark:bg-zinc-800'}`}>
            <Ionicons name={icon} size={20} color={isSelected ? '#FFF' : '#666'} />
          </View>
          <Text className={`ml-3 font-semibold ${isSelected ? 'text-[#2D6A4F]' : 'text-gray-700 dark:text-zinc-300'}`}>
            {title}
          </Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color="#2D6A4F" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Configuración</Text>

        {/* Sección de Perfil (Visual) */}
        <View className="bg-gray-50 dark:bg-zinc-900 p-5 rounded-[24px] mb-6 flex-row items-center shadow-sm border border-gray-100 dark:border-zinc-800">
          <View className="w-16 h-16 rounded-full bg-[#2D6A4F] items-center justify-center shadow-md">
            <Text className="text-white text-2xl font-bold">F</Text>
          </View>
          <View className="ml-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Fede</Text>
            <Text className="text-gray-500 dark:text-zinc-500 text-xs font-semibold">PLAN PREMIUM</Text>
          </View>
        </View>

        {/* Sección de Tema */}
        <Text className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase mb-3 ml-1 tracking-widest">
          APARIENCIA
        </Text>
        <View className="mb-6">
          <ThemeOption title="Modo Claro" value="light" icon="sunny-outline" />
          <ThemeOption title="Modo Oscuro" value="dark" icon="moon-outline" />
          <ThemeOption title="Sistema" value="system" icon="settings-outline" />
        </View>

        {/* Sección de Cuenta */}
        <Text className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase mb-3 ml-1 tracking-widest">
          CUENTA
        </Text>
        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30"
        >
          <Ionicons name="log-out-outline" size={22} color="#791F1F" />
          <Text className="ml-3 font-bold text-[#791F1F]">Cerrar Sesión</Text>
        </TouchableOpacity>

        <View className="mt-12 items-center">
          <Text className="text-gray-400 dark:text-zinc-600 text-[10px] tracking-widest font-bold">FINANCEAPP v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
