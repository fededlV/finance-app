import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { SaldoCard } from '../../src/components/SaldoCard';
import { ResumenChip } from '../../src/components/ResumenChip';
import { MovimientoItem } from '../../src/components/MovimientoItem';
import { GraficoBarras } from '../../src/components/GraficoBarras';
import { usePeriodoStore } from '../../src/store/periodoStore';

import { getPeriodoActual, getPeriodos } from '../../src/api/periodos';
import { getResumen } from '../../src/api/resumen';
import { getGastos } from '../../src/api/gastos';
import { getAhorros } from '../../src/api/ahorros';
import type {
  Periodo,
  Gasto,
  Ahorro,
  ResumenPeriodo,
} from '../../src/types/models';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsIcon: {
    fontSize: 24,
  },
  resumenContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  movimientosContainer: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF4D6D',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  emptyText: {
    color: '#8A8A9A',
    textAlign: 'center',
    paddingVertical: 24,
  },
});

interface GastoMovimiento extends Gasto {
  tipoMovimiento: 'gasto';
}

interface AhorroMovimiento extends Ahorro {
  tipoMovimiento: 'ahorro';
}

type Movimiento = GastoMovimiento | AhorroMovimiento;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { periodo, setPeriodo } = usePeriodoStore();

  const [resumen, setResumen] = useState<ResumenPeriodo | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [datosGrafico, setDatosGrafico] = useState<
    Array<{
      mes: number;
      anio: number;
      total_gastado: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener período actual
      const periodoActual = await getPeriodoActual();
      setPeriodo(periodoActual);

      // Obtener resumen del período
      const resumenData = await getResumen(periodoActual.id);
      setResumen(resumenData);

      // Obtener gastos y ahorros
      const gastos = await getGastos({ periodo_id: periodoActual.id });
      const ahorros = await getAhorros({ periodo_id: periodoActual.id });

      // Combinar y ordenar por fecha descendente
      const movimientosUnificados: Movimiento[] = [
        ...gastos.map((g: Gasto) => ({
          ...g,
          tipoMovimiento: 'gasto' as const,
        })),
        ...ahorros.map((a: Ahorro) => ({
          ...a,
          tipoMovimiento: 'ahorro' as const,
        })),
      ].sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );

      setMovimientos(movimientosUnificados.slice(0, 5));

      // Obtener períodos y sus datos de gastos
      const todos = await getPeriodos();
      const ultimosCuatro = todos.slice(-4);

      // Obtener resumen de cada período para el gráfico
      const datosCharts = await Promise.all(
        ultimosCuatro.map(async (p) => ({
          mes: p.mes,
          anio: p.anio,
          total_gastado: (await getResumen(p.id)).total_gastos,
        })),
      );

      setDatosGrafico(datosCharts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar los datos';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setPeriodo]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00C896" />
        </View>
      </View>
    );
  }

  if (error || !resumen) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {error || 'Error al cargar los datos'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MisFinanzas</Text>
          <TouchableOpacity onPress={() => router.push('/configuracion')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Saldo Card */}
          <SaldoCard saldoDisponible={resumen.saldo_actual} />

          {/* Resumen Chips */}
          <View style={styles.resumenContainer}>
            <ResumenChip
              label="Total gastado"
              amount={resumen.total_gastos}
              icon="💸"
              color="#FF4D6D"
            />
            <ResumenChip
              label="Total ahorrado"
              amount={resumen.total_ahorros}
              icon="🏦"
              color="#00C896"
            />
          </View>

          {/* Gráfico */}
          {datosGrafico.length > 0 && <GraficoBarras datos={datosGrafico} />}

          {/* Últimos Movimientos */}
          <Text style={styles.sectionTitle}>Últimos movimientos</Text>
          {movimientos.length > 0 ? (
            <View style={styles.movimientosContainer}>
              {movimientos.map((mov) => (
                <MovimientoItem
                  key={`${mov.tipoMovimiento}-${mov.id}`}
                  movimiento={
                    mov.tipoMovimiento === 'gasto'
                      ? (mov as Gasto)
                      : (mov as Ahorro)
                  }
                  tipo={mov.tipoMovimiento}
                  iconoCategoria={
                    mov.tipoMovimiento === 'gasto' ? '💳' : '💰'
                  }
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No hay movimientos en este período
            </Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
