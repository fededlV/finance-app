import React from 'react';
import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="nuevo-gasto" />
      <Stack.Screen name="nuevo-ahorro" />
    </Stack>
  );
}
