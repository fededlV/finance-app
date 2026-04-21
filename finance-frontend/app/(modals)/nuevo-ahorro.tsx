import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePeriodoStore } from '../../src/store/periodoStore';
import {
  createAhorro,
  getAhorroById,
  updateAhorro,
} from '../../src/api/ahorros';
import type { Ahorro, CreateAhorroInput, UpdateAhorroInput, Moneda } from '../../src/types/models';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: '#2A2A3A',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    fontSize: 24,
    color: '#8A8A9A',
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A9A',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1C1C27',
    borderColor: '#2A2A3A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  amountInput: {
    backgroundColor: '#1C1C27',
    borderColor: '#00C896',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    color: '#00C896',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  errorText: {
    color: '#FF4D6D',
    fontSize: 12,
    marginTop: 4,
  },
  monedaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  monedaOption: {
    flex: 1,
    backgroundColor: '#1C1C27',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2A2A3A',
    paddingVertical: 12,
    alignItems: 'center',
  },
  monedaOptionSelected: {
    borderColor: '#00C896',
  },
  monedaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A8A9A',
  },
  monedaTextSelected: {
    color: '#00C896',
  },
  dateContainer: {
    backgroundColor: '#1C1C27',
    borderRadius: 12,
    padding: 12,
    borderColor: '#2A2A3A',
    borderWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 8,
  },
  dateSegment: {
    flex: 1,
    backgroundColor: '#0F0F14',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  dateButton: {
    padding: 8,
  },
  dateButtonText: {
    fontSize: 18,
    color: '#00C896',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#0F0F14',
    borderTopColor: '#2A2A3A',
    borderTopWidth: 1,
  },
  submitButton: {
    backgroundColor: '#00C896',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#4A4A5A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function NuevoAhorroModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { periodo } = usePeriodoStore();
  const params = useLocalSearchParams();
  const ahorroId = params.ahorroId ? parseInt(params.ahorroId as string) : null;
  const ahorroParam = typeof params.ahorro === 'string' ? params.ahorro : null;
  const isEditing = ahorroId !== null || ahorroParam !== null;

  // Form state
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('ARS');
  const [fecha, setFecha] = useState(new Date());
  const [origen, setOrigen] = useState('');
  const [nota, setNota] = useState('');

  // UI state
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Si estamos editando, cargar los datos del ahorro
      if (ahorroParam) {
        const ahorroFromParams = JSON.parse(ahorroParam) as Ahorro;
        setMonto(ahorroFromParams.monto.toString());
        setDescripcion(ahorroFromParams.descripcion);
        setMoneda(ahorroFromParams.moneda);
        setFecha(new Date(ahorroFromParams.fecha));
        setOrigen(ahorroFromParams.origen || '');
        setNota(ahorroFromParams.nota || '');
      } else if (isEditing && ahorroId) {
        const ahorro = await getAhorroById(ahorroId);
        setMonto(ahorro.monto.toString());
        setDescripcion(ahorro.descripcion);
        setMoneda(ahorro.moneda);
        setFecha(new Date(ahorro.fecha));
        setOrigen(ahorro.origen || '');
        setNota(ahorro.nota || '');
      } else {
        // Para creación, establecer la fecha de hoy
        setFecha(new Date());
        setMoneda('ARS');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar los datos';
      Alert.alert('Error', errorMessage);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const montoNum = parseFloat(monto);
    if (!monto || montoNum <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (fecha > today) {
      newErrors.fecha = 'La fecha no puede ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !periodo?.id) return;

    setSubmitting(true);
    try {
      const montoNum = parseFloat(monto);
      const dateString = fecha.toISOString().split('T')[0];

      if (isEditing && ahorroId) {
        // Modo edición
        const payload: UpdateAhorroInput = {
          descripcion: descripcion.trim(),
          monto: montoNum,
          moneda,
          fecha: dateString,
          origen: origen.trim() || undefined,
          nota: nota.trim() || undefined,
        };
        await updateAhorro(ahorroId, payload);
      } else {
        // Modo creación
        const payload: CreateAhorroInput = {
          periodo_id: periodo.id,
          descripcion: descripcion.trim(),
          monto: montoNum,
          moneda,
          fecha: dateString,
          origen: origen.trim() || undefined,
          nota: nota.trim() || undefined,
        };
        await createAhorro(payload);
      }

      // Cerrar el modal
      router.back();

      // Mostrar confirmación
      Alert.alert(
        'Éxito',
        isEditing ? 'Ahorro actualizado correctamente' : 'Ahorro agregado correctamente',
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al guardar el ahorro';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (type: 'day' | 'month' | 'year', delta: number) => {
    const newDate = new Date(fecha);

    switch (type) {
      case 'day':
        newDate.setDate(newDate.getDate() + delta);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + delta);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + delta);
        break;
    }

    setFecha(newDate);
    setErrors((prev) => ({ ...prev, fecha: '' }));
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C896" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar ahorro' : 'Nuevo ahorro'}
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Monto */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Monto</Text>
          <TextInput
            style={[
              styles.amountInput,
              errors.monto && { borderColor: '#FF4D6D' },
            ]}
            placeholder="$ 0.00"
            placeholderTextColor="#4A4A5A"
            keyboardType="decimal-pad"
            value={monto}
            onChangeText={(text) => {
              setMonto(text);
              setErrors((prev) => ({ ...prev, monto: '' }));
            }}
          />
          {errors.monto && <Text style={styles.errorText}>{errors.monto}</Text>}
        </View>

        {/* Moneda */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Moneda</Text>
          <View style={styles.monedaGrid}>
            {['ARS', 'USD'].map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.monedaOption,
                  moneda === m && styles.monedaOptionSelected,
                ]}
                onPress={() => setMoneda(m as Moneda)}
              >
                <Text
                  style={[
                    styles.monedaText,
                    moneda === m && styles.monedaTextSelected,
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[
              styles.input,
              errors.descripcion && { borderColor: '#FF4D6D' },
            ]}
            placeholder="¿De dónde es el ahorro?"
            placeholderTextColor="#4A4A5A"
            value={descripcion}
            onChangeText={(text) => {
              setDescripcion(text);
              setErrors((prev) => ({ ...prev, descripcion: '' }));
            }}
            maxLength={100}
          />
          {errors.descripcion && (
            <Text style={styles.errorText}>{errors.descripcion}</Text>
          )}
        </View>

        {/* Origen */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Origen (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Fuente del ahorro"
            placeholderTextColor="#4A4A5A"
            value={origen}
            onChangeText={setOrigen}
            maxLength={100}
          />
        </View>

        {/* Fecha */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Fecha</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateRow}>
              <View style={styles.dateSegment}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => handleDateChange('day', 1)}
                >
                  <Text style={styles.dateButtonText}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.dateValue}>
                  {fecha.getDate().toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => handleDateChange('day', -1)}
                >
                  <Text style={styles.dateButtonText}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateSegment}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => handleDateChange('month', 1)}
                >
                  <Text style={styles.dateButtonText}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.dateValue}>
                  {(fecha.getMonth() + 1).toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => handleDateChange('month', -1)}
                >
                  <Text style={styles.dateButtonText}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateSegment}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => handleDateChange('year', 1)}
                >
                  <Text style={styles.dateButtonText}>▲</Text>
                </TouchableOpacity>
                <Text style={styles.dateValue}>{fecha.getFullYear()}</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => handleDateChange('year', -1)}
                >
                  <Text style={styles.dateButtonText}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {errors.fecha && <Text style={styles.errorText}>{errors.fecha}</Text>}
        </View>

        {/* Nota */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nota (Opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nota adicional (opcional)"
            placeholderTextColor="#4A4A5A"
            value={nota}
            onChangeText={setNota}
            maxLength={200}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (submitting || !monto || !descripcion) && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={submitting || !monto || !descripcion}
        >
          <Text style={styles.submitButtonText}>
            {submitting
              ? 'Guardando...'
              : isEditing
                ? 'Guardar cambios'
                : 'Agregar ahorro'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
