import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { View } from "react-native";
import "../global.css";

/**
 * AMOLEDTheme: Configuración de tema negro puro para navegación.
 */
const AMOLEDTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#000000',
    card: '#000000',
    border: '#27272a', // zinc-800
    text: '#ffffff',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={AMOLEDTheme}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: "#000000" }}>
          <Stack 
            screenOptions={{ 
              headerShown: false,
              contentStyle: { backgroundColor: "#000000" } 
            }}
          >
            {/* Definición de rutas principales */}
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="agregar-transaccion" />
          </Stack>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
