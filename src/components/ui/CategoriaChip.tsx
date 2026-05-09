/**
 * Propósito: Botón de filtro horizontal para seleccionar categorías.
 * Ubicación: src/components/ui/CategoriaChip.tsx
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  activo: boolean;
  onPress: () => void;
}

const CategoriaChip: React.FC<Props> = ({ label, activo, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.chip, activo && styles.chipActivo]} 
      onPress={onPress}
    >
      <Text style={[styles.label, activo && styles.labelActivo]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  chipActivo: {
    backgroundColor: '#2D6A4F',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  labelActivo: {
    color: '#FFF',
  },
});

export default CategoriaChip;
