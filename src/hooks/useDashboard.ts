import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../services/api';
import { Transaccion } from '../types';
import { Periodo } from '../types/finance';

export function useDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [periodo, setPeriodo] = useState<Periodo | null>(null);
  const [balance, setBalance] = useState({
    total: 0,
    ingresos: 0,
    egresos: 0,
    ahorros: 0,
  });
  const [ultimasTransacciones, setUltimasTransacciones] = useState<Transaccion[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let currentPeriod: Periodo;
      let resumenData: any = null;
      let gastosData: any[] = [];
      let ahorrosData: any[] = [];
      let ingresosData: any[] = [];

      try {
        currentPeriod = await api.getPeriodoActual();
        setPeriodo(currentPeriod);

        // 2. Obtener resumen del período
        resumenData = await api.getResumen(currentPeriod?.id ?? 0);

        // 3. Obtener gastos, ahorros e ingresos en paralelo
        const [gastos, ahorros, ingresos] = await Promise.all([
          api.getGastos({ periodo_id: currentPeriod?.id ?? 0 }),
          api.getAhorros(),
          api.getIngresos({ periodo_id: currentPeriod?.id ?? 0 }),
        ]);
        gastosData = gastos;
        ahorrosData = ahorros;
        ingresosData = ingresos;
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          const now = new Date();
          currentPeriod = {
            id: 0,
            mes: now.getMonth() + 1,
            anio: now.getFullYear(),
            dinero_inicial: 0,
            tipo_cambio_usd: null,
          };
          setPeriodo(currentPeriod);
        } else {
          throw err;
        }
      }

      const tipoCambio = currentPeriod?.tipo_cambio_usd ?? 1;

      if (!currentPeriod || currentPeriod.id === 0) {
        setBalance({
          total: 0,
          ingresos: 0,
          egresos: 0,
          ahorros: 0,
        });
        setUltimasTransacciones([]);
      } else {
        // 4. Calcular ahorros totales convertidos si es en USD
        const totalAhorradoArs = (resumenData?.total_ahorrado_ars ?? 0) + ((resumenData?.total_ahorrado_usd ?? 0) * tipoCambio);

        setBalance({
          total: resumenData?.saldo_disponible ?? 0,
          ingresos: resumenData?.total_ingresado ?? 0,
          egresos: resumenData?.total_gastado ?? 0,
          ahorros: totalAhorradoArs,
        });

        // 5. Mapear gastos de base de datos a Transaccion de la UI
        const transaccionesGastos: Transaccion[] = (gastosData ?? []).map((g) => ({
          id: `g-${g?.id ?? 0}`,
          tipo: 'gasto',
          categoria: getCategoriaKeyById(g?.categoria_id ?? 0),
          descripcion: g?.descripcion ?? '',
          monto: g?.monto ?? 0,
          fecha: g?.fecha ?? '',
        }));

        // Mapear ahorros de base de datos a Transaccion de la UI
        const transaccionesAhorros: Transaccion[] = (ahorrosData ?? [])
          .filter((a) => a && a.periodo_id === currentPeriod.id)
          .map((a) => ({
            id: `a-${a?.id ?? 0}`,
            tipo: 'ahorro',
            categoria: 'ahorro',
            descripcion: a?.descripcion ?? '',
            monto: a?.moneda === 'USD' ? (a?.monto ?? 0) * tipoCambio : (a?.monto ?? 0),
            fecha: a?.fecha ?? '',
          }));

        // Mapear ingresos de base de datos a Transaccion de la UI
        const transaccionesIngresos: Transaccion[] = (ingresosData ?? []).map((i) => ({
          id: `i-db-${i?.id ?? 0}`,
          tipo: 'ingreso',
          categoria: 'trabajo',
          descripcion: i?.descripcion ?? '',
          monto: i?.monto ?? 0,
          fecha: i?.fecha ?? '',
        }));

        // Registrar dinero inicial como una transacción virtual de ingreso
        const transaccionInicial: Transaccion = {
          id: `i-${currentPeriod.id}`,
          tipo: 'ingreso',
          categoria: 'trabajo',
          descripcion: 'Dinero Inicial Período',
          monto: currentPeriod?.dinero_inicial ?? 0,
          fecha: currentPeriod?.created_at ? currentPeriod.created_at.split('T')[0] : '2026-05-01',
        };

        const todas = [transaccionInicial, ...transaccionesIngresos, ...transaccionesGastos, ...transaccionesAhorros];

        // Ordenar cronológicamente en orden descendente y limitar a 5
        const ordenadas = todas
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 5);

        setUltimasTransacciones(ordenadas);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar los datos del panel.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    isLoading,
    error,
    balance,
    periodo,
    ultimasTransacciones,
    refetch: fetchDashboardData,
  };
}

/**
 * Mapea los IDs de categoría del backend a los IDs descriptivos usados por el componente TransaccionItem
 */
function getCategoriaKeyById(id: number): string {
  const mapping: Record<number, string> = {
    1: 'comida',
    2: 'transporte',
    3: 'salud',
    4: 'ocio',
    5: 'hogar',
    6: 'otro',
    7: 'educacion',
    8: 'otro',
  };
  return mapping[id] || 'otro';
}
