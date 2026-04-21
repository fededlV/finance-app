import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    marginRight: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
  },
  chipSelected: {
    backgroundColor: '#00C896',
  },
  chipUnselected: {
    backgroundColor: '#1C1C27',
    borderColor: '#2A2A3A',
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  textSelected: {
    color: '#FFFFFF',
  },
  textUnselected: {
    color: '#8A8A9A',
  },
});

interface CategoriaChipProps {
  nombre: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export function CategoriaChip({
  nombre,
  selected,
  onPress,
  color,
}: CategoriaChipProps) {
  const chipStyle = selected
    ? [
        styles.chip,
        styles.chipSelected,
        color && { backgroundColor: color },
      ]
    : [styles.chip, styles.chipUnselected];

  const textStyle = selected ? styles.textSelected : styles.textUnselected;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={chipStyle}>
        <Text style={[styles.text, textStyle]}>{nombre}</Text>
      </View>
    </TouchableOpacity>
  );
}
