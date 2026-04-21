import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createAhorro, getAhorroById, updateAhorro } from '../../src/api/ahorros';
import { usePeriodoStore } from '../../src/store/periodoStore';
import type { Ahorro, CreateAhorroInput, Moneda, UpdateAhorroInput } from '../../src/types/models';

const ORIGENES = ['Sueldo', 'Venta', 'Regalo', 'Otro'] as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F0F14',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '90%',
    backgroundColor: '#0F0F14',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopColor: '#23232F',
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2B',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C27',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 22,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#8A8A9A',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleOption: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    backgroundColor: '#1C1C27',
    paddingVertical: 14,
    alignItems: 'center',
  },
  toggleOptionSelected: {
    backgroundColor: '#00C896',
    borderColor: '#00C896',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8A8A9A',
  },
  toggleTextSelected: {
    color: '#FFFFFF',
  },
  amountInput: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    paddingVertical: 16,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  errorText: {
    color: '#FF4D6D',
    fontSize: 12,
    marginTop: 6,
  },
  originWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  originChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#1C1C27',
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  originChipSelected: {
    backgroundColor: '#00C896',
    borderColor: '#00C896',
  },
  originText: {
    color: '#8A8A9A',
    fontSize: 13,
    fontWeight: '600',
  },
  originTextSelected: {
    color: '#FFFFFF',
  },
  datePickerWrap: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    overflow: 'hidden',
  },
  dateSummary: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  noteInput: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: '#0F0F14',
    borderTopWidth: 1,
    borderTopColor: '#1F1F2B',
  },
  submitButton: {
    borderRadius: 16,
    backgroundColor: '#00C896',
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type AhorroParams = {
  ahorro?: string;
  ahorroId?: string;
};

function formatDate(date: Date) {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function NuevoAhorroModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<AhorroParams>();
  const { periodo } = usePeriodoStore();

  const ahorroParam = typeof params.ahorro === 'string' ? params.ahorro : null;
  const ahorroId = params.ahorroId ? Number(params.ahorroId) : null;
  const isEditing = Boolean(ahorroParam || ahorroId);

  const [moneda, setMoneda] = useState<Moneda>('ARS');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [origen, setOrigen] = useState<(typeof ORIGENES)[number] | null>(null);
  const [fecha, setFecha] = useState(new Date());
  const [nota, setNota] = useState('');
  const [errors, setErrors] = useState<{ monto?: string; descripcion?: string }>({});
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (ahorroParam) {
          const ahorro = JSON.parse(ahorroParam) as Ahorro;
          if (!mounted) return;
          setMoneda(ahorro.moneda);
          setMonto(String(ahorro.monto));
          setDescripcion(ahorro.descripcion);
          setOrigen((ORIGENES as readonly string[]).includes(ahorro.origen || '') ? (ahorro.origen as (typeof ORIGENES)[number]) : 'Otro');
          setFecha(new Date(ahorro.fecha));
          setNota(ahorro.nota ?? '');
          return;
        }

        if (ahorroId) {
          const ahorro = await getAhorroById(ahorroId);
          if (!mounted) return;
          setMoneda(ahorro.moneda);
          setMonto(String(ahorro.monto));
          setDescripcion(ahorro.descripcion);
          setOrigen((ORIGENES as readonly string[]).includes(ahorro.origen || '') ? (ahorro.origen as (typeof ORIGENES)[number]) : 'Otro');
          setFecha(new Date(ahorro.fecha));
          setNota(ahorro.nota ?? '');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo cargar el ahorro';
        Alert.alert('Error', message);
        router.back();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [ahorroId, ahorroParam, router]);

  const amountPlaceholder = useMemo(
    () => (moneda === 'USD' ? 'USD 0.00' : '$ 0.00'),
    [moneda],
  );

  const validate = () => {
    const nextErrors: { monto?: string; descripcion?: string } = {};

    if (!monto || Number(monto) <= 0) {
      nextErrors.monto = 'El monto debe ser mayor a 0';
    }

    if (!descripcion.trim()) {
      nextErrors.descripcion = 'La descripción no puede estar vacía';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const emitRefresh = () => {
    DeviceEventEmitter.emit('ahorros:refresh');
  };

  const handleSave = async () => {
    if (!validate() || !periodo?.id) return;

    try {
      setSaving(true);
      const payloadBase = {
        descripcion: descripcion.trim(),
        monto: Number(monto),
        moneda,
        origen: origen ?? undefined,
        fecha: fecha.toISOString().split('T')[0],
        nota: nota.trim() || undefined,
      };

      if (isEditing && ahorroId) {
        const payload: UpdateAhorroInput = {
          ...payloadBase,
        };
        await updateAhorro(ahorroId, payload);
      } else if (isEditing && ahorroParam) {
        const ahorro = JSON.parse(ahorroParam) as Ahorro;
        const payload: UpdateAhorroInput = {
          ...payloadBase,
        };
        await updateAhorro(ahorro.id, payload);
      } else {
        const payload: CreateAhorroInput = {
          periodo_id: periodo.id,
          ...payloadBase,
        };
        await createAhorro(payload);
      }

      emitRefresh();
      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el ahorro';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#00C896" size="large" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>{isEditing ? 'Editar ahorro' : 'Nuevo ahorro'}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Moneda</Text>
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleOption, moneda === 'ARS' && styles.toggleOptionSelected]}
                onPress={() => setMoneda('ARS')}
              >
                <Text style={[styles.toggleText, moneda === 'ARS' && styles.toggleTextSelected]}>ARS $</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleOption, moneda === 'USD' && styles.toggleOptionSelected]}
                onPress={() => setMoneda('USD')}
              >
                <Text style={[styles.toggleText, moneda === 'USD' && styles.toggleTextSelected]}>USD 💵</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Monto</Text>
            <TextInput
              style={styles.amountInput}
              value={monto}
              onChangeText={(text) => {
                setMonto(text.replace(',', '.'));
                if (errors.monto) setErrors((prev) => ({ ...prev, monto: undefined }));
              }}
              placeholder={amountPlaceholder}
              placeholderTextColor="#7A7A8C"
              keyboardType="decimal-pad"
            />
            {errors.monto ? <Text style={styles.errorText}>{errors.monto}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={styles.input}
              value={descripcion}
              onChangeText={(text) => {
                setDescripcion(text);
                if (errors.descripcion) setErrors((prev) => ({ ...prev, descripcion: undefined }));
              }}
              placeholder="¿De dónde proviene este ahorro?"
              placeholderTextColor="#7A7A8C"
            />
            {errors.descripcion ? <Text style={styles.errorText}>{errors.descripcion}</Text> : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Origen</Text>
            <View style={styles.originWrap}>
              {ORIGENES.map((item) => {
                const selected = origen === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setOrigen(item)}
                    style={[styles.originChip, selected && styles.originChipSelected]}
                  >
                    <Text style={[styles.originText, selected && styles.originTextSelected]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Fecha</Text>
            <Pressable onPress={() => setShowDatePicker(true)} style={styles.datePickerWrap}>
              <Text style={styles.dateSummary}>{formatDate(fecha)}</Text>
            </Pressable>
            {showDatePicker ? (
              <DateTimePicker
                value={fecha}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setFecha(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            ) : null}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nota</Text>
            <TextInput
              style={styles.noteInput}
              value={nota}
              onChangeText={setNota}
              placeholder="Nota adicional (opcional)"
              placeholderTextColor="#7A7A8C"
              multiline
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSave}
            disabled={saving}
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          >
            <Text style={styles.submitButtonText}>
              {saving
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Registrar ahorro'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
