import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  chartContainer: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    borderLeftColor: '#2A2A3A',
    borderLeftWidth: 1,
    borderBottomColor: '#2A2A3A',
    borderBottomWidth: 1,
    paddingLeft: 12,
    paddingBottom: 12,
    paddingRight: 12,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  barContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: '#00C896',
    borderRadius: 4,
    width: '80%',
  },
  barValue: {
    color: '#FFFFFF',
    fontSize: 10,
    marginBottom: 6,
    fontWeight: '600',
  },
  barLabel: {
    color: '#8A8A9A',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#8A8A9A',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

interface GraficoBarrasProps {
  datos: Array<{
    mes: number;
    anio: number;
    total_gastado: number;
  }>;
}

export function GraficoBarras({ datos }: GraficoBarrasProps) {
  const maxValue = useMemo(
    () => Math.max(...datos.map((d) => d.total_gastado), 1000),
    [datos],
  );

  if (datos.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Últimos 4 meses</Text>
        <Text style={styles.emptyText}>No hay datos disponibles</Text>
      </View>
    );
  }

  const maxBarHeight = 150;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Últimos 4 meses</Text>
      <View style={styles.chartContainer}>
        {datos.map((item, index) => {
          const totalGastado = Number(item.total_gastado ?? 0);
          const barHeight = (totalGastado / maxValue) * maxBarHeight;
          return (
            <View key={`${item.mes}-${item.anio}`} style={styles.barWrapper}>
              <View style={[styles.barContainer, { height: maxBarHeight }] }>
                <Text style={styles.barValue}>
                  ${totalGastado.toFixed(0)}
                </Text>
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(barHeight, 8) },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>
                {item.mes}/{(item.anio % 100).toString().padStart(2, '0')}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
