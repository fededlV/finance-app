/**
 * Propósito: Estadísticas adaptadas a Expo Router con cálculo de evolución de ahorros.
 * Ubicación: app/(tabs)/resumen.tsx
 */

import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { PolarChart, Pie, CartesianChart, Bar } from 'victory-native';
import { useFinanceStore, getCategoriaKeyById } from '../../src/store/useFinanceStore';
import { getDatosMesAnterior, CATEGORIAS } from '../../src/mocks/data';
import ComparacionMensualCard from '../../src/components/features/ComparacionMensualCard';
import { api } from '../../src/services/api';
import { formatMoney } from '../../src/utils/currency';
import { Ahorro, Periodo } from '../../src/types/finance';

export default function ResumenScreen() {
  const transacciones = useFinanceStore(state => state.transacciones) ?? [];
  const periodos = useFinanceStore(state => state.periodos) ?? [];
  const fetchDatos = useFinanceStore(state => state.fetchDatos);
  const comparativa = useFinanceStore(state => state.comparativa);
  const resumen = useFinanceStore(state => state.resumen);
  const periodo = useFinanceStore(state => state.periodo);
  const mesAnterior = getDatosMesAnterior() ?? { gastos: 0, ahorros: 0 };

  const [ahorros, setAhorros] = useState<Ahorro[]>([]);
  const [loading, setLoading] = useState(true);
  const [historicoGastos, setHistoricoGastos] = useState<{ mes: string; monto: number }[]>([]);
  const [exporting, setExporting] = useState(false);

  const handleExportExcel = async () => {
    if (!periodo?.id) {
      Alert.alert('Error', 'No hay un período activo para exportar.');
      return;
    }

    try {
      setExporting(true);
      const base64Data = await api.exportarPeriodoExcel(periodo.id);
      
      const filename = `Resumen_Periodo_${periodo.id}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Exportar Resumen del Periodo',
          UTI: 'com.microsoft.excel.xls',
        });
      } else {
        Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo.');
      }
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      const errMsg = error instanceof Error ? error.message : 'No se pudo exportar el archivo Excel.';
      Alert.alert('Error', errMsg);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    async function loadHistoricalData() {
      try {
        setLoading(true);
        await fetchDatos();
        const list = await api.getAhorros();
        setAhorros(list);
      } catch (err) {
        console.warn('Failed to load savings history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistoricalData();
  }, [fetchDatos]);

  const balance = useMemo(() => {
    const safeTrans = transacciones ?? [];
    const ingresos = safeTrans.filter(x => x?.tipo === 'ingreso').reduce((a, b) => a + (b?.monto ?? 0), 0);
    const egresos = safeTrans.filter(x => x?.tipo === 'gasto').reduce((a, b) => a + (b?.monto ?? 0), 0);
    const ahorrosTotal = safeTrans.filter(x => x?.tipo === 'ahorro').reduce((a, b) => a + (b?.monto ?? 0), 0);
    return { total: ingresos - egresos, ingresos, egresos, ahorros: ahorrosTotal };
  }, [transacciones]);

  const dataPie = useMemo(() => {
    const list = resumen?.gastos_por_categoria ?? [];
    const colorScale = ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2", "#B7E4C7", "#D8F3DC"];
    
    return list.map((g, index) => ({ 
      x: g.nombre, 
      y: g.total,
      porcentaje: g.porcentaje,
      color: colorScale[index % colorScale.length]
    }));
  }, [resumen]);

  const percentageAhorro = (balance?.ingresos ?? 0) > 0 ? ((balance?.ahorros ?? 0) / (balance?.ingresos ?? 1)) * 100 : 0;
  const eficiencia = (balance?.ingresos ?? 0) > 0 ? ((1 - (balance?.egresos ?? 0) / (balance?.ingresos ?? 1)) * 100) : 0;

  // Ordenar periodos de forma cronológica ascendente
  const periodosOrdenados = useMemo(() => {
    return [...periodos].sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      return a.mes - b.mes;
    });
  }, [periodos]);

  useEffect(() => {
    async function loadGastosHistoricos() {
      if (periodosOrdenados.length === 0) return;
      try {
        const last3 = periodosOrdenados.slice(-3);
        const data = await Promise.all(
          last3.map(async (p) => {
            const res = await api.getResumen(p.id);
            const mesesAbreviados = [
              'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
              'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
            ];
            return {
              mes: mesesAbreviados[p.mes - 1] || 'Mes',
              monto: res.total_gastado,
            };
          })
        );
        setHistoricoGastos(data);
      } catch (err) {
        console.warn('Failed to load historical expenses:', err);
      }
    }
    loadGastosHistoricos();
  }, [periodosOrdenados]);

  // Calcular crecimiento acumulado de ahorros en ARS y USD
  const evolucionAhorros = useMemo(() => {
    let acumuladoArs = 0;
    let acumuladoUsd = 0;

    return periodosOrdenados.map((p) => {
      const ahorrosDelPeriodo = ahorros.filter((a) => a && a.periodo_id === p.id);
      
      const totalArsDelPeriodo = ahorrosDelPeriodo
        .filter((a) => a.moneda === 'ARS')
        .reduce((sum, curr) => sum + (curr.monto ?? 0), 0);

      const totalUsdDelPeriodo = ahorrosDelPeriodo
        .filter((a) => a.moneda === 'USD')
        .reduce((sum, curr) => sum + (curr.monto ?? 0), 0);

      acumuladoArs += totalArsDelPeriodo;
      acumuladoUsd += totalUsdDelPeriodo;

      return {
        periodoId: p.id,
        mes: p.mes,
        anio: p.anio,
        montoArs: acumuladoArs,
        montoUsd: acumuladoUsd,
      };
    });
  }, [periodosOrdenados, ahorros]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Análisis de Rendimiento</Text>
          {periodo && periodo.id > 0 && (
            <Pressable
              onPress={handleExportExcel}
              disabled={exporting}
              className={`flex-row items-center px-4 py-2 rounded-xl bg-emerald-600 active:bg-emerald-700 dark:bg-emerald-700 dark:active:bg-emerald-800 ${exporting ? 'opacity-50' : ''}`}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="white" style={{ marginRight: 6 }} />
              ) : (
                <Ionicons name="document-text-outline" size={18} color="white" style={{ marginRight: 6 }} />
              )}
              <Text className="text-sm font-semibold text-white">
                {exporting ? 'Exportando...' : 'Excel'}
              </Text>
            </Pressable>
          )}
        </View>

        <View className="mb-2">
          <ComparacionMensualCard 
            titulo="Análisis de Gastos"
            actual={comparativa?.periodo_actual?.total_gastado !== undefined ? comparativa.periodo_actual.total_gastado : balance.egresos}
            anterior={comparativa?.periodo_anterior?.total_gastado !== undefined ? comparativa.periodo_anterior.total_gastado : mesAnterior.gastos}
            tipo="gasto"
          />
          <ComparacionMensualCard 
            titulo="Análisis de Ahorro"
            actual={comparativa?.periodo_actual?.total_ahorrado_ars !== undefined ? comparativa.periodo_actual.total_ahorrado_ars : balance.ahorros}
            anterior={comparativa?.periodo_anterior?.total_ahorrado_ars !== undefined ? comparativa.periodo_anterior.total_ahorrado_ars : mesAnterior.ahorros}
            tipo="ahorro"
          />
        </View>

        <View className="bg-gray-50 dark:bg-zinc-900 p-5 rounded-[24px] mb-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">Gastos por Categoría</Text>
          {dataPie.length > 0 ? (
            <>
              <View style={{ height: 260, width: '100%' }}>
                <PolarChart
                  data={dataPie}
                  labelKey="x"
                  valueKey="y"
                  colorKey="color"
                >
                  <Pie.Chart />
                </PolarChart>
              </View>
              <View className="flex-row flex-wrap justify-center mt-4">
                 {dataPie.map((item, i) => (
                   <View key={i} className="flex-row items-center mr-4 mb-2">
                     <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                     <Text className="text-xs text-gray-600 dark:text-zinc-400">
                       {item.x}: {item.porcentaje.toFixed(1)}%
                     </Text>
                   </View>
                 ))}
              </View>
            </>
          ) : (
            <View className="h-[260px] justify-center items-center">
              <View className="w-12 h-12 bg-gray-100 dark:bg-zinc-800/50 rounded-full items-center justify-center mb-2">
                <Ionicons name="pie-chart-outline" size={24} color="#a1a1aa" />
              </View>
              <Text className="text-sm text-gray-400 dark:text-zinc-500 text-center font-medium">
                No hay gastos registrados en este período.
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-between mb-5">
          <View className="flex-1 bg-gray-50 dark:bg-zinc-900 p-4 rounded-[24px] mr-2 items-center border border-gray-100 dark:border-zinc-800 shadow-sm">
            <Text className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase font-bold mb-1">% Ahorro</Text>
            <Text className="text-xl font-bold text-[#185FA5]">{percentageAhorro.toFixed(1)}%</Text>
          </View>
          <View className="flex-1 bg-gray-50 dark:bg-zinc-900 p-4 rounded-[24px] ml-2 items-center border border-gray-100 dark:border-zinc-800 shadow-sm">
            <Text className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase font-bold mb-1">Eficiencia</Text>
            <Text className="text-xl font-bold text-[#2D6A4F]">{eficiencia.toFixed(1)}%</Text>
          </View>
        </View>

        {/* Evolución Histórica de Ahorros (US-15) */}
        <View className="bg-gray-50 dark:bg-zinc-900 p-5 rounded-[24px] mb-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Ionicons name="trending-up-outline" size={20} color="#185FA5" style={{ marginRight: 8 }} />
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Evolución de Ahorros Acumulados
            </Text>
          </View>
          
          {loading ? (
            <ActivityIndicator size="small" color="#185FA5" />
          ) : evolucionAhorros.length > 0 ? (
            <View className="space-y-3">
              {evolucionAhorros.map((item) => {
                const mesesNombres = [
                  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ];
                const mesNombre = mesesNombres[item.mes - 1] || 'Mes';
                return (
                  <View 
                    key={item.periodoId} 
                    className="flex-row justify-between items-center bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-gray-100 dark:border-zinc-900 mb-2"
                  >
                    <View>
                      <Text className="text-sm font-bold text-gray-900 dark:text-white">
                        {mesNombre} {item.anio}
                      </Text>
                      <Text className="text-[10px] text-gray-400 dark:text-zinc-500">
                        Corte mensual acumulado
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                        ARS: {formatMoney(item.montoArs, 'ARS')}
                      </Text>
                      <Text className="text-xs font-semibold text-[#185FA5] mt-0.5">
                        USD: {formatMoney(item.montoUsd, 'USD')}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text className="text-sm text-gray-400 dark:text-zinc-500 text-center font-medium">
              No hay ahorros históricos registrados.
            </Text>
          )}
        </View>

        {/* Estado de Presupuestos (US-18) */}
        <View className="bg-gray-50 dark:bg-zinc-900 p-5 rounded-[24px] mb-5 border border-gray-100 dark:border-zinc-800 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Ionicons name="wallet-outline" size={20} color="#791F1F" style={{ marginRight: 8 }} />
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              Control de Presupuestos
            </Text>
          </View>
          
          {resumen?.presupuestos_estado && resumen.presupuestos_estado.length > 0 ? (
            <View className="space-y-3">
              {resumen.presupuestos_estado.map((item, idx) => {
                const catKey = getCategoriaKeyById(item.categoria_id);
                const catObj = CATEGORIAS.find(c => c.id === catKey);
                const nombre = catObj ? catObj.nombre : 'Otro';
                const icon = catObj ? catObj.icon : 'add-circle';
                
                const isCritical = item.porcentaje_usado >= 80;
                
                return (
                  <View 
                    key={idx} 
                    className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-gray-100 dark:border-zinc-900 mb-3"
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 justify-center items-center mr-2">
                          <Ionicons name={icon as any} size={16} color={isCritical ? '#EF4444' : '#2D6A4F'} />
                        </View>
                        <Text className="text-sm font-bold text-gray-900 dark:text-white">
                          {nombre}
                        </Text>
                      </View>
                      {isCritical ? (
                        <View className="bg-red-100 dark:bg-red-950/50 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900">
                          <Text className="text-[10px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider">
                            CRÍTICO {Math.round(item.porcentaje_usado)}%
                          </Text>
                        </View>
                      ) : (
                        <Text className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                          {Math.round(item.porcentaje_usado)}% usado
                        </Text>
                      )}
                    </View>
                    
                    {/* Barra de progreso */}
                    <View className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
                      <View 
                        className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-[#2D6A4F]'}`}
                        style={{ width: `${Math.min(item.porcentaje_usado, 100)}%` }}
                      />
                    </View>
                    
                    <View className="flex-row justify-between items-center">
                      <Text className="text-[10px] text-gray-400 dark:text-zinc-500">
                        Progreso del límite mensual
                      </Text>
                      <Text className="text-xs text-gray-700 dark:text-zinc-300 font-medium">
                        {formatMoney(item.gastado, 'ARS')} / <Text className="font-bold text-gray-900 dark:text-white">{formatMoney(item.limite, 'ARS')}</Text>
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text className="text-sm text-gray-400 dark:text-zinc-500 text-center font-medium py-2">
              No hay presupuestos configurados en este período.
            </Text>
          )}
        </View>

        <View className="bg-gray-50 dark:bg-zinc-900 p-5 rounded-[24px] mb-8 border border-gray-100 dark:border-zinc-800 shadow-sm">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">Histórico de Gastos</Text>
          {historicoGastos.length > 0 ? (
            <View style={{ height: 180, width: '100%' }}>
              <CartesianChart 
                data={historicoGastos} 
                xKey="mes" 
                yKeys={["monto"]}
                domainPadding={{ left: 50, right: 50, top: 30 }}
              >
                {({ points, chartBounds }) => (
                  <Bar
                    points={points.monto}
                    chartBounds={chartBounds}
                    color="#791F1F"
                    roundedCorners={{ topLeft: 8, topRight: 8 }}
                  />
                )}
              </CartesianChart>
            </View>
          ) : (
            <View className="h-[180px] justify-center items-center">
              <ActivityIndicator size="small" color="#791F1F" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
