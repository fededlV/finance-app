/**
 * Propósito: Configuración de la navegación por pestañas (Bottom Tabs) y stacks.
 * Ubicación: src/navigation/AppNavigator.tsx
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import GastosScreen from '../screens/GastosScreen';
import ResumenScreen from '../screens/ResumenScreen';
import NuevaTransaccionScreen from '../screens/NuevaTransaccionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Gastos') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Estadísticas') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2D6A4F',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          maxWidth: 480,
          alignSelf: 'center',
          width: '100%',
        }
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Gastos" component={GastosScreen} />
      <Tab.Screen name="Estadísticas" component={ResumenScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen 
        name="Nueva" 
        component={NuevaTransaccionScreen} 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
