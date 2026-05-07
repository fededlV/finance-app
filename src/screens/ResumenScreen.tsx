/**
 * Propósito: Visualización de estadísticas y gráficos por categoría usando Victory Native XL (v41+).
 * Ubicación: src/screens/ResumenScreen.tsx
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { PolarChart, Pie, CartesianChart, Bar } from 'victory-native';
import { getGastosPorCategoria, getBalance, getDatosMesAnterior } from '../mocks/data';
import ComparacionMensualCard from '../components/ComparacionMensualCard';

const ResumenScreen = () => {
  const dataPieRaw = getGastosPorCategoria();
  const balance = getBalance();
  const mesAnterior = getDatosMesAnterior();
  const porcentajeAhorro = (balance.ahorros / balance.ingresos) * 100;

  // Adaptar datos para PolarChart (v41 requiere colores explícitos o manejo manual)
  const colorScale = ["#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2", "#B7E4C7", "#D8F3DC"];
  const dataPie = dataPieRaw.map((item, index) => ({
    ...item,
    color: colorScale[index % colorScale.length]
  }));

  const dataBar = [
    { mes: 'Mar', monto: 120000 },
    { mes: 'Abr', monto: 150000 },
    { mes: 'May', monto: balance.egresos }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Análisis de Rendimiento</Text>

        <View style={styles.comparacionContainer}>
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

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Gastos por Categoría</Text>
          <View style={{ height: 300, width: '100%' }}>
            <PolarChart
              data={dataPie}
              labelKey="x"
              valueKey="y"
              colorKey="color"
            >
              <Pie.Chart />
            </PolarChart>
          </View>
          <View style={styles.legend}>
             {dataPie.map((item, i) => (
               <View key={i} style={styles.legendItem}>
                 <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                 <Text style={styles.legendText}>{item.x}: {Math.round((item.y / balance.egresos) * 100)}%</Text>
               </View>
             ))}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>% Ahorro</Text>
            <Text style={[styles.statValue, { color: '#185FA5' }]}>{porcentajeAhorro.toFixed(1)}%</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Eficiencia</Text>
            <Text style={[styles.statValue, { color: '#2D6A4F' }]}>{((1 - balance.egresos/balance.ingresos)*100).toFixed(1)}%</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Últimos 3 Meses</Text>
          <View style={{ height: 200, width: '100%' }}>
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  comparacionContainer: {
    marginBottom: 10,
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  legend: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default ResumenScreen;
