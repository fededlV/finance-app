import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { FABButton } from '../../src/components/FABButton';
import { MovimientoItem } from '../../src/components/MovimientoItem';
import { usePeriodoStore } from '../../src/store/periodoStore';
import { deleteAhorro, getAhorros } from '../../src/api/ahorros';
import type { Ahorro } from '../../src/types/models';

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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8A8A9A',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#123B33',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 150, 0.35)',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 8,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryHint: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    borderBottomColor: '#2A2A3A',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#00C896',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8A9A',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 120,
  },
  tabTotalContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabTotalLabel: {
    fontSize: 12,
    color: '#8A8A9A',
    marginBottom: 4,
    fontWeight: '500',
  },
  tabTotalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabEquivalent: {
    marginTop: 6,
    fontSize: 12,
    color: '#8A8A9A',
  },
  listContainer: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  swipeAction: {
    width: 92,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF4D6D',
    marginVertical: 1,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  swipeActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 56,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8A8A9A',
    textAlign: 'center',
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
  fabContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});

type TabKey = 'ARS' | 'USD';

type SavingsItem = Ahorro & {
  moneda: 'ARS' | 'USD';
};

export default function AhorrosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { periodo } = usePeriodoStore();

  const [ahorros, setAhorros] = useState<SavingsItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('ARS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAhorros = useCallback(async () => {
    if (!periodo?.id) {
      setError('No hay un período activo');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getAhorros({ periodo_id: periodo.id });
      setAhorros(data as SavingsItem[]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar los ahorros';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [periodo?.id]);

  useFocusEffect(
    useCallback(() => {
      if (periodo?.id) {
        loadAhorros();
      }
    }, [loadAhorros, periodo?.id]),
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('ahorros:refresh', () => {
      if (periodo?.id) {
        loadAhorros();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadAhorros, periodo?.id]);

  const monthYear = useMemo(() => {
    if (!periodo) return '';
    return new Date(periodo.anio, periodo.mes - 1).toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric',
    });
  }, [periodo]);

  const arsAhorros = useMemo(
    () => ahorros.filter((item) => item.moneda === 'ARS'),
    [ahorros],
  );

  const usdAhorros = useMemo(
    () => ahorros.filter((item) => item.moneda === 'USD'),
    [ahorros],
  );

  const totalArs = useMemo(
    () => arsAhorros.reduce((sum, item) => sum + item.monto, 0),
    [arsAhorros],
  );

  const totalUsd = useMemo(
    () => usdAhorros.reduce((sum, item) => sum + item.monto, 0),
    [usdAhorros],
  );

  const combinedTotalArs = useMemo(() => {
    const usdEquivalent = periodo?.tipo_cambio_usd
      ? totalUsd * periodo.tipo_cambio_usd
      : 0;
    return totalArs + usdEquivalent;
  }, [periodo?.tipo_cambio_usd, totalArs, totalUsd]);

  const activeList = activeTab === 'ARS' ? arsAhorros : usdAhorros;
  const activeTotal = activeTab === 'ARS' ? totalArs : totalUsd;

  const formatMoney = (value: number, currency: TabKey | 'ARS') => {
    if (currency === 'USD') {
      return `US$ ${value.toFixed(2)}`;
    }
    return `$ ${value.toFixed(2)}`;
  };

  const handleDelete = (ahorro: SavingsItem) => {
    Alert.alert(
      'Eliminar ahorro',
      `¿Eliminar "${ahorro.descripcion}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAhorro(ahorro.id);
              await loadAhorros();
            } catch (err) {
              const errorMessage =
                err instanceof Error
                  ? err.message
                  : 'No se pudo eliminar el ahorro';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ],
    );
  };

  const handleEdit = (ahorro: SavingsItem) => {
    router.push({
      pathname: '/modals/nuevo-ahorro',
      params: { ahorro: JSON.stringify(ahorro) },
    });
  };

  const renderRightActions = (ahorro: SavingsItem) => (
    <TouchableOpacity style={styles.swipeAction} onPress={() => handleDelete(ahorro)}>
      <Text style={styles.swipeActionText}>Eliminar</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: SavingsItem }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
      <Pressable onPress={() => handleEdit(item)}>
        <MovimientoItem movimiento={item} tipo="ahorro" iconoCategoria="💰" />
      </Pressable>
    </Swipeable>
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

  if (error) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ahorros</Text>
        <Text style={styles.headerSubtitle}>
          {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total ahorrado combinado</Text>
        <Text style={styles.summaryAmount}>{formatMoney(combinedTotalArs, 'ARS')}</Text>
        {periodo?.tipo_cambio_usd ? (
          <Text style={styles.summaryHint}>Incluye conversión de USD a ARS</Text>
        ) : null}
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'ARS' && styles.tabButtonActive]}
          onPress={() => setActiveTab('ARS')}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'ARS' && styles.tabLabelActive,
            ]}
          >
            Pesos (ARS)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'USD' && styles.tabButtonActive]}
          onPress={() => setActiveTab('USD')}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'USD' && styles.tabLabelActive,
            ]}
          >
            Dólares (USD)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tabTotalContainer}>
          <Text style={styles.tabTotalLabel}>
            Total en {activeTab === 'ARS' ? 'pesos' : 'dólares'}
          </Text>
          <Text style={styles.tabTotalAmount}>{formatMoney(activeTotal, activeTab)}</Text>
          {activeTab === 'USD' && periodo?.tipo_cambio_usd ? (
            <Text style={styles.tabEquivalent}>
              Equivalente: $ {(activeTotal * periodo.tipo_cambio_usd).toFixed(2)} ARS
            </Text>
          ) : null}
        </View>

        {activeList.length > 0 ? (
          <View style={styles.listContainer}>
            <FlatList
              data={activeList}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💸</Text>
            <Text style={styles.emptyText}>No hay ahorros en esta moneda</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <FABButton onPress={() => router.push('/modals/nuevo-ahorro')} />
      </View>
    </SafeAreaView>
  );
}
