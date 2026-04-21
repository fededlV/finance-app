import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCategorias } from '../../src/api/categorias';
import { createGasto, getGastoById, updateGasto } from '../../src/api/gastos';
import { usePeriodoStore } from '../../src/store/periodoStore';
import type { Categoria, CreateGastoInput, Moneda, UpdateGastoInput } from '../../src/types/models';

const CURRENCY_OPTIONS: Array<{ value: Moneda; label: string }> = [
  { value: 'ARS', label: 'ARS $' },
  { value: 'USD', label: 'USD 💵' },
];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Alimentación': 'fast-food-outline',
  'Educación': 'book-outline',
  'Entretenimiento': 'game-controller-outline',
  'Indumentaria': 'shirt-outline',
  'Otros': 'ellipsis-horizontal-circle-outline',
  'Salud': 'medkit-outline',
  'Servicios': 'flash-outline',
  'Transporte': 'car-outline',
};

const MONEDA_META_REGEX = /\n?\[moneda:\s*(ARS|USD)\]\s*$/i;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A8A9A',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  currencyButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1C1C27',
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  currencyButtonSelected: {
    backgroundColor: '#00C896',
    borderColor: '#00C896',
  },
  currencyButtonText: {
    color: '#8A8A9A',
    fontSize: 13,
    fontWeight: '700',
  },
  currencyButtonTextSelected: {
    color: '#FFFFFF',
  },
  amountInput: {
    backgroundColor: '#1C1C27',
    borderColor: '#00C896',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
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
  errorText: {
    color: '#FF4D6D',
    fontSize: 12,
    marginTop: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  categoryOption: {
    width: '23.5%',
    aspectRatio: 1,
    backgroundColor: '#1C1C27',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2A2A3A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  categoryIcon: {
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 10,
    color: '#8A8A9A',
    textAlign: 'center',
  },
  dateContainer: {
    backgroundColor: '#1C1C27',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderColor: '#2A2A3A',
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 250,
  },
  dateButton: {
    backgroundColor: '#1C1C27',
    borderColor: '#2A2A3A',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dateButtonHint: {
    color: '#8A8A9A',
    fontSize: 12,
    marginTop: 4,
  },
  noteInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
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
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.55,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#0F0F14',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#2A2A3A',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  pickerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  pickerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  pickerAction: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCancel: {
    backgroundColor: '#1C1C27',
    borderWidth: 1,
    borderColor: '#2A2A3A',
  },
  pickerConfirm: {
    backgroundColor: '#00C896',
  },
  pickerActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

function hexToRgba(color: string | undefined, alpha: number) {
  if (!color || !color.startsWith('#')) {
    return `rgba(0, 200, 150, ${alpha})`;
  }

  const hex = color.replace('#', '');
  const normalized = hex.length === 3
    ? hex.split('').map((char) => char + char).join('')
    : hex.slice(0, 6);

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function stripMonedaMetadata(note: string | null | undefined) {
  if (!note) return { note: '', moneda: 'ARS' as Moneda };

  const match = note.match(MONEDA_META_REGEX);
  const moneda = (match?.[1] as Moneda | undefined) ?? 'ARS';
  const cleanedNote = note.replace(MONEDA_META_REGEX, '').trim();

  return { note: cleanedNote, moneda };
}

function buildNotaWithMoneda(note: string, moneda: Moneda) {
  const cleaned = note.trim();
  if (!cleaned && moneda === 'ARS') return undefined;
  if (moneda === 'ARS') return cleaned || undefined;

  const body = cleaned ? `${cleaned}\n\n[moneda: ${moneda}]` : `[moneda: ${moneda}]`;
  return body;
}

export default function NuevoGastoModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { periodo } = usePeriodoStore();
  const params = useLocalSearchParams();
  const gastoId = params.gastoId ? parseInt(params.gastoId as string, 10) : null;
  const isEditing = gastoId !== null;

  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(new Date());
  const [draftFecha, setDraftFecha] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [nota, setNota] = useState('');
  const [moneda, setMoneda] = useState<Moneda>('ARS');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const categoriasData = await getCategorias();
        if (!mounted) return;
        setCategorias(categoriasData);

        if (isEditing && gastoId) {
          const gasto = await getGastoById(gastoId);
          if (!mounted) return;
          setMonto(gasto.monto.toString());
          setDescripcion(gasto.descripcion);
          setCategoriaId(gasto.categoria_id);
          setFecha(new Date(gasto.fecha));
          setDraftFecha(new Date(gasto.fecha));

          const parsedNote = stripMonedaMetadata(gasto.nota || '');
          setNota(parsedNote.note);
          setMoneda(parsedNote.moneda);
        } else {
          setFecha(new Date());
          setDraftFecha(new Date());
          setMoneda('ARS');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
        Alert.alert('Error', errorMessage);
        router.back();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [gastoId, isEditing, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const montoNum = Number.parseFloat(monto);
    if (!monto || Number.isNaN(montoNum) || montoNum <= 0) {
      newErrors.monto = 'El monto debe ser mayor a $0';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (categoriaId === null) {
      newErrors.categoria = 'Debes seleccionar una categoría';
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
    if (!validateForm() || !periodo?.id || categoriaId === null) return;

    setSubmitting(true);
    try {
      const montoNum = Number.parseFloat(monto);
      const dateString = formatDate(fecha);
      const noteWithCurrency = buildNotaWithMoneda(nota, moneda);

      if (isEditing && gastoId) {
        const payload: UpdateGastoInput = {
          descripcion: descripcion.trim(),
          monto: montoNum,
          categoria_id: categoriaId,
          fecha: dateString,
          nota: noteWithCurrency,
        };
        await updateGasto(gastoId, payload);
      } else {
        const payload: CreateGastoInput = {
          periodo_id: periodo.id,
          descripcion: descripcion.trim(),
          monto: montoNum,
          categoria_id: categoriaId,
          fecha: dateString,
          nota: noteWithCurrency,
        };
        await createGasto(payload);
      }

      router.back();
      Alert.alert('Éxito', isEditing ? 'Gasto actualizado correctamente' : 'Gasto agregado correctamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el gasto';
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const currentCurrencyLabel = moneda === 'ARS' ? '$ 0.00' : 'USD 0.00';
  const formattedDate = fecha.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C896" />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={[styles.sheet, { paddingTop: insets.top }]}> 
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{isEditing ? 'Editar gasto' : 'Nuevo gasto'}</Text>
          <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cerrar modal">
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Moneda</Text>
            <View style={styles.currencyRow}>
              {CURRENCY_OPTIONS.map((option) => {
                const selected = moneda === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.currencyButton, selected && styles.currencyButtonSelected]}
                    onPress={() => setMoneda(option.value)}
                  >
                    <Text style={[styles.currencyButtonText, selected && styles.currencyButtonTextSelected]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Monto</Text>
            <TextInput
              style={styles.amountInput}
              placeholder={currentCurrencyLabel}
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

          <View style={styles.section}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, errors.descripcion && { borderColor: '#FF4D6D' }]}
              placeholder="¿En qué gastaste?"
              placeholderTextColor="#4A4A5A"
              value={descripcion}
              onChangeText={(text) => {
                setDescripcion(text);
                setErrors((prev) => ({ ...prev, descripcion: '' }));
              }}
              maxLength={100}
            />
            {errors.descripcion && <Text style={styles.errorText}>{errors.descripcion}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.categoriesGrid}>
              {categorias.map((cat) => {
                const selected = categoriaId === cat.id;
                const iconName = CATEGORY_ICONS[cat.nombre] ?? 'ellipsis-horizontal-circle-outline';
                const categoryColor = cat.color ?? '#00C896';

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      selected && {
                        borderColor: categoryColor,
                        backgroundColor: hexToRgba(categoryColor, 0.14),
                      },
                    ]}
                    onPress={() => {
                      setCategoriaId(cat.id);
                      setErrors((prev) => ({ ...prev, categoria: '' }));
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={iconName}
                      size={22}
                      color={categoryColor}
                      style={styles.categoryIcon}
                    />
                    <Text
                      style={[
                        styles.categoryName,
                        selected && {
                          color: categoryColor,
                          fontWeight: '700',
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.categoria && <Text style={styles.errorText}>{errors.categoria}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Fecha</Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  setDraftFecha(fecha);
                  setShowDatePicker(true);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.dateButtonText}>{formattedDate}</Text>
                <Text style={styles.dateButtonHint}>Toca para cambiar la fecha</Text>
              </TouchableOpacity>
            </View>
            {errors.fecha && <Text style={styles.errorText}>{errors.fecha}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Nota (Opcional)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="Nota adicional (opcional)"
              placeholderTextColor="#4A4A5A"
              value={nota}
              onChangeText={setNota}
              maxLength={200}
              multiline
              numberOfLines={4}
            />
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (submitting || !monto || !descripcion || categoriaId === null) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={submitting || !monto || !descripcion || categoriaId === null}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Agregar gasto'}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.pickerBackdrop}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerTitle}>Seleccionar fecha</Text>
              <DateTimePicker
                value={draftFecha}
                mode="date"
                display="spinner"
                themeVariant="dark"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setDraftFecha(selectedDate);
                  }
                }}
                style={{ width: '100%', height: Platform.OS === 'ios' ? 260 : 280 }}
              />
              <View style={styles.pickerActions}>
                <Pressable
                  style={[styles.pickerAction, styles.pickerCancel]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.pickerActionText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.pickerAction, styles.pickerConfirm]}
                  onPress={() => {
                    setFecha(draftFecha);
                    setErrors((prev) => ({ ...prev, fecha: '' }));
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.pickerActionText}>OK</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}
