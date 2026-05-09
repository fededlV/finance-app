import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

/**
 * HomeScreen: Pantalla de inicio para verificar el tema AMOLED y layout responsivo.
 * Utiliza clases de NativeWind (Tailwind CSS) para el diseño.
 */
export default function LandingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="items-center">
        <Text className="text-white text-5xl font-extrabold tracking-tight text-center">
          Finanzas S21
        </Text>
        <Text className="text-zinc-400 text-lg mt-4 text-center">
          Gestión financiera premium con estética One UI y modo AMOLED.
        </Text>
      </View>
      
      {/* Botón interactivo para navegar a la app principal */}
      <View className="absolute bottom-12 w-full px-6">
        <Pressable 
          onPress={() => router.replace("/(tabs)")}
          className="bg-zinc-900 h-16 rounded-3xl items-center justify-center active:bg-zinc-800"
        >
          <Text className="text-white font-semibold text-base">
            Comenzar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
