import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getPeriodos } from '../../src/api/periodos';
import { getResumen, getResumenComparativa } from '../../src/api/resumen';
import { usePeriodoStore } from '../../src/store/periodoStore';
import type { Periodo, ResumenComparativa, ResumenPeriodo, ResumenGastoCategoria } from '../../src/types/models';
import { GraficoTorta } from '../../src/components/GraficoTorta';
import { ComparativaCard } from '../../src/components/ComparativaCard';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C27',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  legendCard: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#2A2A3A',
    borderBottomWidth: 1,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  legendAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  legendPct: {
    color: '#8A8A9A',
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    padding: 16,
  },
  progressRow: {
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressText: {
    color: '#8A8A9A',
    fontSize: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2A2A3A',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  savingsCard: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  savingsTitle: {
    color: '#8A8A9A',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 8,
  },
  savingsValue: {
    color: '#00C896',
    fontSize: 34,
    fontWeight: '800',
  },
  savingsHint: {
    color: '#8A8A9A',
    marginTop: 8,
    fontSize: 12,
  },
  empty: {
    color: '#8A8A9A',
    textAlign: 'center',
    paddingVertical: 20,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4D6D',
    textAlign: 'center',
  },
});

const colorPalette = ['#00C896', '#4E8BFF', '#FFB84D', '#FF6B6B', '#A36CFF', '#33D6D6', '#F97316', '#F43F5E'];

function monthLabel(periodo: Periodo | null) {
  if (!periodo) return '';
  return new Date(periodo.anio, periodo.mes - 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });
}

function formatMoney(value: number | null | undefined) {
  return `$ ${(value ?? 0).toFixed(2)}`;
}

function getBudgetBarColor(porcentaje: number | null | undefined) {
  if (porcentaje == null) return '#00C896';
  if (porcentaje > 100) return '#FF4D6D';
  if (porcentaje >= 80) return '#FFB84D';
  return '#00C896';
}

function emptyMetric() {
  return {
    actual: 0,
    anterior: null,
    variacion_abs: null,
    variacion_pct: null,
  };
}

function normalizeComparativa(
  comparativaData: ResumenComparativa,
): ResumenComparativa {
  return {
    ...comparativaData,
    gastos: comparativaData.gastos ?? emptyMetric(),
    ahorros: comparativaData.ahorros ?? emptyMetric(),
    saldo: comparativaData.saldo ?? emptyMetric(),
  };
}

export default function ResumenScreen() {
  const insets = useSafeAreaInsets();
  const { periodo, setPeriodo } = usePeriodoStore();

  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [resumen, setResumen] = useState<ResumenPeriodo | null>(null);
  const [comparativa, setComparativa] = useState<ResumenComparativa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const currentPeriod = useMemo(() => periodos[selectedIndex] ?? periodo ?? null, [periodos, periodo, selectedIndex]);

  const loadData = useCallback(async (selectedPeriod?: Periodo | null) => {
    const target = selectedPeriod ?? currentPeriod;
    if (!target) return;

    try {
      setLoading(true);
      setError(null);
      const [resumenData, comparativaData] = await Promise.all([
        getResumen(target.id),
        getResumenComparativa(target.id),
      ]);
      setResumen(resumenData);
      setComparativa(normalizeComparativa(comparativaData));
      setPeriodo(target);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el resumen';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentPeriod, setPeriodo]);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        setLoading(true);
        const allPeriods = await getPeriodos();
        const sorted = [...allPeriods].sort((a, b) => {
          if (a.anio !== b.anio) return a.anio - b.anio;
          return a.mes - b.mes;
        });
        if (!mounted) return;
        setPeriodos(sorted);

        const currentId = periodo?.id;
        const initialIndex = currentId
          ? Math.max(sorted.findIndex((item) => item.id === currentId), 0)
          : Math.max(sorted.length - 1, 0);
        setSelectedIndex(initialIndex);
        const initialPeriod = sorted[initialIndex] ?? null;
        await loadData(initialPeriod);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo cargar la lista de períodos';
        if (mounted) {
          setError(message);
          setLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [loadData, periodo?.id]);

  useFocusEffect(
    useCallback(() => {
      if (currentPeriod) {
        loadData(currentPeriod);
      }
    }, [currentPeriod, loadData]),
  );

  const goToPeriod = (direction: -1 | 1) => {
    const nextIndex = selectedIndex + direction;
    if (nextIndex < 0 || nextIndex >= periodos.length) return;
    const next = periodos[nextIndex];
    setSelectedIndex(nextIndex);
    loadData(next);
  };

  const legendItems = useMemo(() => {
    const categories = resumen?.gastos_por_categoria ?? [];
    const total = resumen?.total_gastos ?? 0;
    return categories.map((item, index) => {
      const percentage = total > 0 ? (item.monto / total) * 100 : 0;
      return {
        ...item,
        color: colorPalette[index % colorPalette.length],
        percentage,
      };
    });
  }, [resumen]);

  const presupuestos = useMemo(() => {
    return (resumen?.gastos_por_categoria ?? []).filter((item) => item.presupuesto != null);
  }, [resumen]);

  const gastosComparativa = comparativa?.gastos ?? emptyMetric();
  const ahorrosComparativa = comparativa?.ahorros ?? emptyMetric();

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#00C896" size="large" />
        </View>
      </View>
    );
  }

  if (error || !resumen || !comparativa) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{error ?? 'No hay datos para mostrar'}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Resumen</Text>
            <View style={styles.monthSelector}>
              <TouchableOpacity style={styles.monthButton} onPress={() => goToPeriod(-1)} disabled={selectedIndex <= 0}>
                <Text style={styles.monthButtonText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthText}>{monthLabel(currentPeriod)}</Text>
              <TouchableOpacity style={styles.monthButton} onPress={() => goToPeriod(1)} disabled={selectedIndex >= periodos.length - 1}>
                <Text style={styles.monthButtonText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <GraficoTorta categorias={resumen.gastos_por_categoria} totalGastado={resumen.total_gastos ?? 0} />
          <View style={styles.legendCard}>
            {legendItems.length > 0 ? legendItems.map((item, index) => (
              <View key={item.categoria_id} style={[styles.legendItem, index === legendItems.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.legendLeft}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendName}>{item.categoria}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.legendAmount}>{formatMoney(item.monto)}</Text>
                  <Text style={styles.legendPct}>{item.percentage.toFixed(1)}%</Text>
                </View>
              </View>
            )) : <Text style={styles.empty}>No hay gastos por categoría</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comparativa con mes anterior</Text>
          <View style={styles.row}>
            <ComparativaCard
              title="Gastos"
              actual={gastosComparativa.actual}
              previous={gastosComparativa.anterior}
              variationPct={gastosComparativa.variacion_pct}
              betterWhenHigher={false}
            />
            <ComparativaCard
              title="Ahorros"
              actual={ahorrosComparativa.actual}
              previous={ahorrosComparativa.anterior}
              variationPct={ahorrosComparativa.variacion_pct}
              betterWhenHigher
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado de presupuestos</Text>
          <View style={styles.card}>
            {presupuestos.length > 0 ? presupuestos.map((item) => {
              const usage = item.porcentaje_uso ?? (item.presupuesto ? (item.monto / item.presupuesto) * 100 : 0);
              const color = getBudgetBarColor(usage);
              return (
                <View key={item.categoria_id} style={styles.progressRow}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>{item.categoria}</Text>
                    <Text style={styles.progressText}>
                      {formatMoney(item.monto)} / {formatMoney(item.presupuesto ?? 0)}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.min(usage, 100)}%`, backgroundColor: color }]} />
                  </View>
                </View>
              );
            }) : <Text style={styles.empty}>No hay presupuestos para este período</Text>}
          </View>
        </View>

        <View style={styles.savingsCard}>
          <Text style={styles.savingsTitle}>Porcentaje de ahorro del mes</Text>
          <Text style={styles.savingsValue}>
            {resumen.total_gastos > 0
              ? `${((resumen.total_ahorros / resumen.total_gastos) * 100).toFixed(1)}%`
              : '0.0%'}
          </Text>
          <Text style={styles.savingsHint}>Ahorros en ARS sobre el total gastado del período</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
