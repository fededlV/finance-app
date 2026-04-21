import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { CategoriaChip } from '../../src/components/CategoriaChip';
import { FABButton } from '../../src/components/FABButton';
import { MovimientoItem } from '../../src/components/MovimientoItem';

import { usePeriodoStore } from '../../src/store/periodoStore';
import { getCategorias } from '../../src/api/categorias';
import { getGastos, deleteGasto } from '../../src/api/gastos';
import type { Categoria, Gasto } from '../../src/types/models';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  totalContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 12,
    color: '#8A8A9A',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF4D6D',
  },
  categoriesScroll: {
    paddingHorizontal: 12,
    marginBottom: 16,
    maxHeight: 50,
  },
  listContainer: {
    backgroundColor: '#1C1C27',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 100,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8A8A9A',
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
    bottom: 0,
    right: 0,
  },
});

export default function GastosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { periodo } = usePeriodoStore();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useFocusEffect(
      React.useCallback(() => {
        loadData();
      }, [periodo?.id]),
    );

    // Mantener el useEffect para la inicialización
  useEffect(() => {
    loadData();
  }, [periodo?.id]);

  const loadData = async () => {
    if (!periodo?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar categorías
      const categoriasData = await getCategorias();
      setCategorias(categoriasData);

      // Cargar gastos
      const gastosData = await getGastos({ periodo_id: periodo.id });
      setGastos(gastosData);
      setSelectedCategoriaId(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar los datos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!periodo?.id) return;

    try {
      const gastosData = await getGastos(
        selectedCategoriaId
          ? {
              periodo_id: periodo.id,
              categoria_id: selectedCategoriaId,
            }
          : { periodo_id: periodo.id },
      );
      setGastos(gastosData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al refrescar';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleCategorySelect = async (categoriaId: number | null) => {
    if (!periodo?.id) return;

    try {
      setSelectedCategoriaId(categoriaId);

      const gastosData = await getGastos(
        categoriaId
          ? {
              periodo_id: periodo.id,
              categoria_id: categoriaId,
            }
          : { periodo_id: periodo.id },
      );
      setGastos(gastosData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al filtrar';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleDeleteGasto = (gasto: Gasto) => {
    Alert.alert(
      'Eliminar gasto',
      `¿Estás seguro de que quieres eliminar "${gasto.descripcion}"?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await deleteGasto(gasto.id);
              await handleRefresh();
            } catch (err) {
              const errorMessage =
                err instanceof Error
                  ? err.message
                  : 'Error al eliminar el gasto';
              Alert.alert('Error', errorMessage);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleEditGasto = (gasto: Gasto) => {
    router.push({
      pathname: '/modals/nuevo-gasto',
      params: { gastoId: gasto.id.toString() },
    });
  };

  const handleGastoPress = (gasto: Gasto) => {
    Alert.alert(
      gasto.descripcion,
      `Monto: $${gasto.monto.toFixed(2)}\nFecha: ${new Date(gasto.fecha).toLocaleDateString('es-AR')}`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        { text: 'Editar', onPress: () => handleEditGasto(gasto) },
        {
          text: 'Eliminar',
          onPress: () => handleDeleteGasto(gasto),
          style: 'destructive',
        },
      ],
    );
  };

  const displayedGastos = gastos;
  const total = displayedGastos.reduce((sum, g) => sum + g.monto, 0);

  const monthYear = periodo
    ? new Date(periodo.anio, periodo.mes - 1).toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
      })
    : '';

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gastos</Text>
        <Text style={styles.headerSubtitle}>
          {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
        </Text>
      </View>

      {/* Total */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total del mes</Text>
        <Text style={styles.totalAmount}>
          ${total.toFixed(2)}
        </Text>
      </View>

      {/* Categorías Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        <CategoriaChip
          nombre="Todos"
          selected={selectedCategoriaId === null}
          onPress={() => handleCategorySelect(null)}
        />
        {categorias.map((cat) => (
          <CategoriaChip
            key={cat.id}
            nombre={cat.nombre}
            selected={selectedCategoriaId === cat.id}
            onPress={() => handleCategorySelect(cat.id)}
          />
        ))}
      </ScrollView>

      {/* Gastos List */}
      {displayedGastos.length > 0 ? (
        <View style={styles.listContainer}>
          <FlatList
            data={displayedGastos}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleGastoPress(item)}>
                <MovimientoItem
                  movimiento={item}
                  tipo="gasto"
                  iconoCategoria="💳"
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💸</Text>
          <Text style={styles.emptyText}>No hay gastos este mes</Text>
        </View>
      )}

      {/* FAB Button */}
      <View style={styles.fabContainer}>
        <FABButton onPress={() => router.push('/modals/nuevo-gasto')} />
      </View>
    </SafeAreaView>
  );
}
