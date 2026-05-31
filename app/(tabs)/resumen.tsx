/**
 * Propósito: Estadísticas adaptadas a Expo Router.
 * Ubicación: app/(tabs)/resumen.tsx
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PolarChart, Pie, CartesianChart, Bar } from 'victory-native';
import { useFinanceStore } from '../../src/store/useFinanceStore';
import { getDatosMesAnterior, CATEGORIAS } from '../../src/mocks/data';
import ComparacionMensualCard from '../../src/components/features/ComparacionMensualCard';

export default function ResumenScreen() {
  const transacciones = useFinanceStore(state => state.transacciones) ?? [];
  const mesAnterior = getDatosMesAnterior() ?? { gastos: 0, ahorros: 0 };

  const balance = useMemo(() => {
    const safeTrans = transacciones ?? [];
    const ingresos = safeTrans.filter(x => x?.tipo === 'ingreso').reduce((a, b) => a + (b?.monto ?? 0), 0);
    const egresos = safeTrans.filter(x => x?.tipo === 'gasto').reduce((a, b) => a + (b?.monto ?? 0), 0);
    const ahorros = safeTrans.filter(x => x?.tipo === 'ahorro').reduce((a, b) => a + (b?.monto ?? 0), 0);
    return { total: ingresos - egresos, ingresos, egresos, ahorros };
  }, [transacciones]);

  const dataPie = useMemo(() => {
    const safeTrans = transacciones ?? [];
    const gastos = safeTrans.filter(t => t?.tipo === 'gasto');
    const mapa: Record<string, number> = {};
    gastos.forEach(g => { 
      if (g?.categoria) {
        mapa[g.categoria] = (mapa[g.categoria] || 0) + (g?.monto ?? 0); 
      }
    });

    const colorScale = ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2", "#B7E4C7", "#D8F3DC"];
    
    return Object.keys(mapa).map((key, index) => ({ 
      x: CATEGORIAS.find(c => c?.id === key)?.nombre || key, 
      y: mapa[key],
      color: colorScale[index % colorScale.length]
    }));
  }, [transacciones]);

  const porcentajeAhorro = (balance?.ingresos ?? 0) > 0 ? ((balance?.ahorros ?? 0) / (balance?.ingresos ?? 1)) * 100 : 0;
  const eficiencia = (balance?.ingresos ?? 0) > 0 ? ((1 - (balance?.egresos ?? 0) / (balance?.ingresos ?? 1)) * 100) : 0;

  const dataBar = [
    { mes: 'Mar', monto: 120000 },
    { mes: 'Abr', monto: 150000 },
    { mes: 'May', monto: balance?.egresos ?? 0 }
  ];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-5">Análisis de Rendimiento</Text>

        <View className="mb-2">
          <ComparacionMensualCard 
            titulo="Análisis de Gastos"
            actual={balance.egresos}
            anterior={mesAnterior.gastos}
            tipo="gasto"
          />
          <ComparacionMensualCard 
            titulo="Análisis de Ahorro"
            actual={balance.ahorros}
            anterior={mesAnterior.ahorros}
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
                       {item.x}: {(balance?.egresos ?? 0) > 0 ? Math.round((item.y / (balance?.egresos ?? 1)) * 100) : 0}%
                     </Text>
                   </View>
                 ))}
              </View>
            </>
          ) : (
            <View className="h-[260px] justify-center items-center">
              <View className="w-12 h-12 bg-gray-100 dark:bg-zinc-800/50 rounded-full items-center justify-center mb-2">
                <Ionicons name="pie-chart-outline" size={24} className="text-gray-400 dark:text-zinc-500" />
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
            <Text className="text-xl font-bold text-[#185FA5]">{porcentajeAhorro.toFixed(1)}%</Text>
          </View>
          <View className="flex-1 bg-gray-50 dark:bg-zinc-900 p-4 rounded-[24px] ml-2 items-center border border-gray-100 dark:border-zinc-800 shadow-sm">
            <Text className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase font-bold mb-1">Eficiencia</Text>
            <Text className="text-xl font-bold text-[#2D6A4F]">{eficiencia.toFixed(1)}%</Text>
          </View>
        </View>

        <View className="bg-gray-50 dark:bg-zinc-900 p-5 rounded-[24px] mb-8 border border-gray-100 dark:border-zinc-800 shadow-sm">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">Histórico de Gastos</Text>
          <View style={{ height: 180, width: '100%' }}>
            <CartesianChart 
              data={dataBar} 
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
