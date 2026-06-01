import { useEffect, useCallback, useMemo } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';

export function useDashboard() {
  const transacciones = useFinanceStore((state) => state.transacciones);
  const balance = useFinanceStore((state) => state.balance);
  const periodo = useFinanceStore((state) => state.periodo);
  const isLoading = useFinanceStore((state) => state.isLoading);
  const error = useFinanceStore((state) => state.error);
  const fetchDatos = useFinanceStore((state) => state.fetchDatos);

  const ultimasTransacciones = useMemo(() => {
    return [...transacciones]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  }, [transacciones]);

  const refetch = useCallback(async () => {
    await fetchDatos();
  }, [fetchDatos]);

  useEffect(() => {
    fetchDatos();
  }, [fetchDatos]);

  return {
    isLoading,
    error,
    balance,
    periodo,
    ultimasTransacciones,
    refetch,
  };
}
