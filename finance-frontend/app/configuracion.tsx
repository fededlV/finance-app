import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';

import { getCategorias } from '../src/api/categorias';
import { deleteAhorro, getAhorros } from '../src/api/ahorros';
import { deleteGasto, getGastos } from '../src/api/gastos';
import { createPresupuesto, getPresupuestos, updatePresupuesto } from '../src/api/presupuestos';
import { getPeriodoActual, updatePeriodo } from '../src/api/periodos';
import { usePeriodoStore } from '../src/store/periodoStore';
import type { Categoria, Periodo, Presupuesto } from '../src/types/models';

type BudgetRow = {
  categoriaId: number;
  categoriaNombre: string;
  presupuestoId?: number;
  value: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#8A8A9A',
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#1C1C27',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  periodInfo: {
    color: '#8A8A9A',
    fontSize: 13,
    marginBottom: 14,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#151520',
    borderColor: '#2A2A3A',
    borderWidth: 1,
    borderRadius: 14,
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputRight: {
    textAlign: 'right',
    minWidth: 110,
  },
  helperText: {
    color: '#8A8A9A',
    fontSize: 12,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#00C896',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#0F0F14',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomColor: '#2A2A3A',
    borderBottomWidth: 1,
  },
  budgetName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  budgetInputWrap: {
    minWidth: 120,
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.35)',
  },
  dangerTitle: {
    color: '#FF6B83',
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 77, 109, 0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 109, 0.35)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dangerButtonText: {
    color: '#FF6B83',
    fontSize: 15,
    fontWeight: '800',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF4D6D',
    textAlign: 'center',
  },
  emptyText: {
    color: '#8A8A9A',
    textAlign: 'center',
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  dangerIcon: {
    color: '#FF6B83',
    fontSize: 18,
    fontWeight: '700',
  },
});

function formatMonthLabel(periodo: Periodo | null) {
  if (!periodo) return '';

  const label = new Date(periodo.anio, periodo.mes - 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

function parseNumberInput(value: string) {
  const normalized = value.trim().replace(/\s+/g, '');
  if (!normalized) return null;

  const hasComma = normalized.includes(',');
  const hasDot = normalized.includes('.');

  let parsedValue = normalized;
  if (hasComma && hasDot) {
    const lastComma = normalized.lastIndexOf(',');
    const lastDot = normalized.lastIndexOf('.');

    if (lastComma > lastDot) {
      parsedValue = normalized.replace(/\./g, '').replace(',', '.');
    } else {
      parsedValue = normalized.replace(/,/g, '');
    }
  } else if (hasComma) {
    parsedValue = normalized.replace(',', '.');
  }

  const parsed = Number(parsedValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatInputValue(value: number | null | undefined, allowEmpty = false) {
  if (value == null) return '';
  if (allowEmpty && value === 0) return '';
  return String(value);
}

function buildBudgetRows(categorias: Categoria[], presupuestos: Presupuesto[]) {
  const presupuestoPorCategoria = new Map<number, Presupuesto>();

  for (const presupuesto of presupuestos) {
    presupuestoPorCategoria.set(presupuesto.categoria_id, presupuesto);
  }

  return categorias.map((categoria) => {
    const existing = presupuestoPorCategoria.get(categoria.id);

    return {
      categoriaId: categoria.id,
      categoriaNombre: categoria.nombre,
      presupuestoId: existing?.id,
      value: existing ? String(existing.monto_limite) : '',
    } satisfies BudgetRow;
  });
}

export default function ConfiguracionScreen() {
  const { setPeriodo } = usePeriodoStore();

  const [periodo, setPeriodoActual] = useState<Periodo | null>(null);
  const [dineroInicial, setDineroInicial] = useState('');
  const [tipoCambioUsd, setTipoCambioUsd] = useState('');
  const [budgetRows, setBudgetRows] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPeriodo, setSavingPeriodo] = useState(false);
  const [savingBudgets, setSavingBudgets] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const actualPeriodo = await getPeriodoActual();
      console.log('[configuracion] periodo actual cargado', {
        periodoId: actualPeriodo.id,
        dineroInicial: actualPeriodo.dinero_inicial,
        tipoCambioUsd: actualPeriodo.tipo_cambio_usd,
      });
      const [categorias, presupuestos] = await Promise.all([
        getCategorias(),
        getPresupuestos({ periodo_id: actualPeriodo.id }),
      ]);

      setPeriodoActual(actualPeriodo);
      setPeriodo(actualPeriodo);
      setDineroInicial(formatInputValue(actualPeriodo.dinero_inicial));
      console.log('[configuracion] dinero inicial mostrado en el input', {
        valorMostrado: formatInputValue(actualPeriodo.dinero_inicial),
      });
      setTipoCambioUsd(formatInputValue(actualPeriodo.tipo_cambio_usd, true));
      setBudgetRows(buildBudgetRows(categorias, presupuestos));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar la configuración';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [setPeriodo]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const canSavePeriodo = useMemo(() => {
    return periodo != null && !savingPeriodo;
  }, [periodo, savingPeriodo]);

  const canSaveBudgets = useMemo(() => {
    return periodo != null && !savingBudgets;
  }, [periodo, savingBudgets]);

  const handleSavePeriodo = async () => {
    if (!periodo) return;

    const dineroInicialValue = parseNumberInput(dineroInicial);
    const tipoCambioValue = tipoCambioUsd.trim() === '' ? 0 : parseNumberInput(tipoCambioUsd);

    console.log('[configuracion] validacion dinero inicial', {
      inputOriginal: dineroInicial,
      valorParseado: dineroInicialValue,
      esValido: dineroInicialValue != null,
    });

    if (dineroInicialValue == null || tipoCambioValue == null) {
      console.warn('[configuracion] validacion fallida al guardar periodo', {
        dineroInicial,
        tipoCambioUsd,
        dineroInicialValue,
        tipoCambioValue,
      });
      Alert.alert('Error', 'Revisa los valores ingresados antes de guardar.');
      return;
    }

    try {
      setSavingPeriodo(true);
      console.log('[configuracion] enviando updatePeriodo', {
        periodoId: periodo.id,
        dinero_inicial: dineroInicialValue,
        tipo_cambio_usd: tipoCambioValue,
      });
      const updated = await updatePeriodo(periodo.id, {
        dinero_inicial: dineroInicialValue,
        tipo_cambio_usd: tipoCambioValue,
      });

      console.log('[configuracion] periodo actualizado', {
        periodoId: updated.id,
        dineroInicial: updated.dinero_inicial,
        tipoCambioUsd: updated.tipo_cambio_usd,
      });

      setPeriodoActual(updated);
      setPeriodo(updated);
      setDineroInicial(formatInputValue(updated.dinero_inicial));
      setTipoCambioUsd(formatInputValue(updated.tipo_cambio_usd, true));
      Alert.alert('Listo', 'Período actualizado correctamente.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el período';
      Alert.alert('Error', message);
    } finally {
      setSavingPeriodo(false);
    }
  };

  const handleSaveBudgets = async () => {
    if (!periodo) return;

    const rowsToSave = budgetRows.filter((row) => row.value.trim() !== '');

    if (rowsToSave.length === 0) {
      Alert.alert('Presupuestos', 'Ingresa al menos un límite mensual para guardar.');
      return;
    }

    try {
      setSavingBudgets(true);

      const updatedRows = [...budgetRows];

      for (const row of rowsToSave) {
        const amount = parseNumberInput(row.value);
        if (amount == null) {
          throw new Error(`El valor de ${row.categoriaNombre} no es válido.`);
        }

        const result = row.presupuestoId
          ? await updatePresupuesto(row.presupuestoId, { monto_limite: amount })
          : await createPresupuesto({
              periodo_id: periodo.id,
              categoria_id: row.categoriaId,
              monto_limite: amount,
            });

        const rowIndex = updatedRows.findIndex((item) => item.categoriaId === row.categoriaId);
        if (rowIndex >= 0) {
          updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            presupuestoId: result.id,
            value: String(result.monto_limite),
          };
        }
      }

      setBudgetRows(updatedRows);
      Alert.alert('Listo', 'Presupuestos guardados correctamente.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron guardar los presupuestos';
      Alert.alert('Error', message);
    } finally {
      setSavingBudgets(false);
    }
  };

  const clearMonthData = async () => {
    if (!periodo) return;

    try {
      setClearingData(true);

      const gastos = await getGastos({ periodo_id: periodo.id });
      for (const gasto of gastos) {
        await deleteGasto(gasto.id);
      }

      const ahorros = await getAhorros({ periodo_id: periodo.id });
      for (const ahorro of ahorros) {
        await deleteAhorro(ahorro.id);
      }

      const refreshedPeriodo = await getPeriodoActual();
      setPeriodoActual(refreshedPeriodo);
      setPeriodo(refreshedPeriodo);
      await loadData();
      Alert.alert('Listo', 'Se eliminaron los gastos y ahorros del mes actual.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo limpiar el mes';
      Alert.alert('Error', message);
    } finally {
      setClearingData(false);
    }
  };

  const handleClearMonth = () => {
    if (!periodo) return;

    Alert.alert(
      'Limpiar datos del mes',
      '¿Estás seguro? Esta acción eliminará todos los gastos y ahorros del mes actual y no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            void clearMonthData();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#00C896" size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !periodo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{error ?? 'No se encontró el período actual'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>Ajusta el período activo, los presupuestos y el mantenimiento del mes.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Período actual</Text>
          <Text style={styles.periodInfo}>Configurando: {formatMonthLabel(periodo)}</Text>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Dinero inicial del mes</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={dineroInicial}
                onChangeText={(text) => {
                  console.log('[configuracion] cambio dinero inicial', {
                    textoIngresado: text,
                  });
                  setDineroInicial(text);
                }}
                placeholder="0"
                placeholderTextColor="#6D6D7F"
              />
            </View>

            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Tipo de cambio USD</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={tipoCambioUsd}
                onChangeText={setTipoCambioUsd}
                placeholder="No configurado"
                placeholderTextColor="#6D6D7F"
              />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonDisabled, !canSavePeriodo && styles.buttonDisabled]}
            onPress={() => void handleSavePeriodo()}
            disabled={!canSavePeriodo}
          >
            <Text style={styles.buttonText}>{savingPeriodo ? 'Guardando...' : 'Guardar cambios'}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presupuestos por categoría</Text>
          {budgetRows.length > 0 ? (
            budgetRows.map((row, index) => (
              <View
                key={row.categoriaId}
                style={[
                  styles.budgetRow,
                  index === budgetRows.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
                ]}
              >
                <Text style={styles.budgetName}>{row.categoriaNombre}</Text>
                <View style={styles.budgetInputWrap}>
                  <TextInput
                    style={[styles.input, styles.inputRight]}
                    keyboardType="decimal-pad"
                    value={row.value}
                    onChangeText={(text) => {
                      setBudgetRows((current) =>
                        current.map((item) =>
                          item.categoriaId === row.categoriaId
                            ? { ...item, value: text }
                            : item,
                        ),
                      );
                    }}
                    placeholder="0"
                    placeholderTextColor="#6D6D7F"
                  />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No se encontraron categorías para presupuestar.</Text>
          )}

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonDisabled, !canSaveBudgets && styles.buttonDisabled, { marginTop: 16 }]}
            onPress={() => void handleSaveBudgets()}
            disabled={!canSaveBudgets}
          >
            <Text style={styles.buttonText}>{savingBudgets ? 'Guardando...' : 'Guardar presupuestos'}</Text>
          </Pressable>
        </View>

        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Zona de peligro</Text>
          <Pressable
            style={({ pressed }) => [styles.dangerButton, pressed && { opacity: 0.85 }]}
            onPress={handleClearMonth}
            disabled={clearingData}
          >
            <Text style={styles.dangerIcon}>!</Text>
            <Text style={styles.dangerButtonText}>
              {clearingData ? 'Limpiando...' : 'Limpiar datos del mes'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}