/**
 * Propósito: Gestión de estado global de transacciones usando Zustand conectado al API.
 * Ubicación: src/store/useFinanceStore.ts
 */

import { create } from 'zustand';
import { Transaccion, TipoTransaccion } from '../types';
import { Periodo, Resumen } from '../types/finance';
import { api, ApiError } from '../services/api';
import { CATEGORIAS } from '../mocks/data';

export interface Balance {
  total: number;
  ingresos: number;
  egresos: number;
  ahorros: number;
}

interface FinanceState {
  transacciones: Transaccion[];
  balance: Balance;
  periodo: Periodo | null;
  periodos: Periodo[];
  isLoading: boolean;
  error: Error | null;
  comparativa: any | null;
  resumen: Resumen | null;
  categoriaFrecuencia: Record<string, number>;

  // Acciones
  fetchDatos: (periodoId?: number) => Promise<void>;
  fetchComparativa: (periodoId: number) => Promise<void>;
  addTransaccion: (tipo: TipoTransaccion, data: any) => Promise<void>;
  updateTransaccion: (id: string, updates: { tipo: TipoTransaccion; data: any }) => Promise<void>;
  deleteTransaccion: (id: string) => Promise<void>;
}

export function getCategoriaIdByKey(key: string): number {
  const mapping: Record<string, number> = {
    'comida': 1,
    'transporte': 2,
    'salud': 3,
    'ocio': 4,
    'hogar': 5,
    'educacion': 7,
    'otro': 8,
  };
  return mapping[key] || 8;
}

export function getCategoriaKeyById(id: number): string {
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

export function parseUiId(id: string): { dbId: number; tipo: TipoTransaccion | 'virtual_inicial' } {
  if (id.startsWith('g-')) {
    return { dbId: parseInt(id.substring(2), 10), tipo: 'gasto' };
  } else if (id.startsWith('a-')) {
    return { dbId: parseInt(id.substring(2), 10), tipo: 'ahorro' };
  } else if (id.startsWith('i-db-')) {
    return { dbId: parseInt(id.substring(5), 10), tipo: 'ingreso' };
  } else if (id.startsWith('i-')) {
    return { dbId: parseInt(id.substring(2), 10), tipo: 'virtual_inicial' };
  }
  return { dbId: 0, tipo: 'gasto' };
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transacciones: [],
  balance: { total: 0, ingresos: 0, egresos: 0, ahorros: 0 },
  periodo: null,
  periodos: [],
  isLoading: false,
  error: null,
  comparativa: null,
  resumen: null,
  categoriaFrecuencia: {},

  fetchDatos: async (periodoId?: number) => {
    set({ isLoading: true, error: null });
    try {
      let currentPeriod: Periodo;
      let resumenData: any = null;
      let gastosData: any[] = [];
      let ahorrosData: any[] = [];
      let ingresosData: any[] = [];
      let periodosList: Periodo[] = [];

      try {
        periodosList = await api.getPeriodos();
        if (periodoId && periodoId > 0) {
          const found = periodosList.find(p => p.id === periodoId);
          if (found) {
            currentPeriod = found;
          } else {
            currentPeriod = await api.getPeriodoActual();
          }
        } else {
          currentPeriod = await api.getPeriodoActual();
        }
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
        } else {
          throw err;
        }
      }

      const activePeriodId = currentPeriod.id;

      if (activePeriodId === 0) {
        set({
          periodo: currentPeriod,
          periodos: periodosList,
          transacciones: [],
          balance: { total: 0, ingresos: 0, egresos: 0, ahorros: 0 },
          isLoading: false,
        });
        return;
      }

      // Fetch summary and data
      resumenData = await api.getResumen(activePeriodId);
      let comparativaData: any = null;
      try {
        comparativaData = await api.getComparativa(activePeriodId);
      } catch (err) {
        console.warn('Failed to fetch comparativa inside fetchDatos:', err);
      }

      const [gastos, ahorros, ingresos] = await Promise.all([
        api.getGastos({ periodo_id: activePeriodId }),
        api.getAhorros(),
        api.getIngresos({ periodo_id: activePeriodId }),
      ]);

      gastosData = gastos;
      ahorrosData = ahorros;
      ingresosData = ingresos;

      const tipoCambio = currentPeriod.tipo_cambio_usd ?? 1;
      const totalAhorradoArs = (resumenData?.total_ahorrado_ars ?? 0) + ((resumenData?.total_ahorrado_usd ?? 0) * tipoCambio);

      const frequency: Record<string, number> = {};
      const transaccionesGastos: Transaccion[] = (gastosData ?? []).map((g) => {
        const catKey = getCategoriaKeyById(g.categoria_id);
        frequency[catKey] = (frequency[catKey] || 0) + 1;
        return {
          id: `g-${g.id}`,
          tipo: 'gasto',
          categoria: catKey,
          descripcion: g.descripcion,
          monto: g.monto,
          fecha: g.fecha,
        };
      });

      const transaccionesAhorros: Transaccion[] = (ahorrosData ?? [])
        .filter((a) => a && a.periodo_id === activePeriodId)
        .map((a) => ({
          id: `a-${a.id}`,
          tipo: 'ahorro',
          categoria: 'ahorro',
          descripcion: a.descripcion,
          monto: a.moneda === 'USD' ? a.monto * tipoCambio : a.monto,
          fecha: a.fecha,
          moneda: a.moneda,
          origen: a.origen,
          montoOriginal: a.monto,
        }));

      const transaccionesIngresos: Transaccion[] = (ingresosData ?? []).map((i) => ({
        id: `i-db-${i.id}`,
        tipo: 'ingreso',
        categoria: 'trabajo',
        descripcion: i.descripcion,
        monto: i.monto,
        fecha: i.fecha,
      }));

      const transaccionInicial: Transaccion = {
        id: `i-${activePeriodId}`,
        tipo: 'ingreso',
        categoria: 'trabajo',
        descripcion: 'Dinero Inicial Período',
        monto: currentPeriod.dinero_inicial,
        fecha: currentPeriod.created_at ? currentPeriod.created_at.split('T')[0] : '2026-05-01',
      };

      const todas = [transaccionInicial, ...transaccionesIngresos, ...transaccionesGastos, ...transaccionesAhorros];

      set({
        periodo: currentPeriod,
        periodos: periodosList,
        transacciones: todas,
        balance: {
          total: resumenData?.saldo_disponible ?? 0,
          ingresos: resumenData?.total_ingresado ?? 0,
          egresos: resumenData?.total_gastado ?? 0,
          ahorros: totalAhorradoArs,
        },
        comparativa: comparativaData,
        resumen: resumenData,
        categoriaFrecuencia: frequency,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err : new Error('Error al cargar datos.') });
    }
  },

  fetchComparativa: async (periodoId: number) => {
    try {
      const comparativaData = await api.getComparativa(periodoId);
      set({ comparativa: comparativaData });
    } catch (err) {
      console.warn('Failed to fetch comparativa:', err);
    }
  },

  addTransaccion: async (tipo: TipoTransaccion, data: any) => {
    const currentPeriodId = get().periodo?.id;
    if (!currentPeriodId) throw new Error('No hay un período activo configurado.');

    const payload = { ...data, periodo_id: currentPeriodId };

    if (tipo === 'gasto') {
      await api.crearGasto(payload);
    } else if (tipo === 'ahorro') {
      await api.crearAhorro(payload);
    } else if (tipo === 'ingreso') {
      await api.crearIngreso(payload);
    }

    // Reload from API to maintain synchronization
    await get().fetchDatos(currentPeriodId);
  },

  deleteTransaccion: async (id: string) => {
    const { dbId, tipo } = parseUiId(id);

    if (tipo === 'virtual_inicial') {
      throw new Error('No se puede eliminar la transacción virtual de dinero inicial.');
    }

    if (tipo === 'gasto') {
      await api.eliminarGasto(dbId);
    } else if (tipo === 'ahorro') {
      await api.eliminarAhorro(dbId);
    } else if (tipo === 'ingreso') {
      await api.eliminarIngreso(dbId);
    }

    // Reload from API to maintain synchronization
    const currentPeriodId = get().periodo?.id;
    if (currentPeriodId) {
      await get().fetchDatos(currentPeriodId);
    }
  },

  updateTransaccion: async (id: string, updates: { tipo: TipoTransaccion; data: any }) => {
    const { dbId, tipo: oldTipo } = parseUiId(id);

    if (oldTipo === 'virtual_inicial') {
      const currentPeriodId = get().periodo?.id;
      if (currentPeriodId) {
        await api.actualizarPeriodo(currentPeriodId, {
          dinero_inicial: updates.data.monto
        });
      }
    } else {
      const currentPeriodId = get().periodo?.id;
      if (oldTipo !== updates.tipo) {
        // Delete old transaction
        if (oldTipo === 'gasto') {
          await api.eliminarGasto(dbId);
        } else if (oldTipo === 'ahorro') {
          await api.eliminarAhorro(dbId);
        } else if (oldTipo === 'ingreso') {
          await api.eliminarIngreso(dbId);
        }

        // Create new transaction in target type
        const payload = {
          ...updates.data,
          periodo_id: currentPeriodId
        };

        if (updates.tipo === 'gasto') {
          await api.crearGasto(payload);
        } else if (updates.tipo === 'ahorro') {
          await api.crearAhorro(payload);
        } else if (updates.tipo === 'ingreso') {
          await api.crearIngreso(payload);
        }
      } else {
        // Normal PATCH update
        if (oldTipo === 'gasto') {
          await api.actualizarGasto(dbId, updates.data);
        } else if (oldTipo === 'ahorro') {
          await api.actualizarAhorro(dbId, updates.data);
        } else if (oldTipo === 'ingreso') {
          await api.actualizarIngreso(dbId, updates.data);
        }
      }
    }

    // Reload from API to maintain synchronization
    const currentPeriodId = get().periodo?.id;
    if (currentPeriodId) {
      await get().fetchDatos(currentPeriodId);
    }
  }
}));

// Selectores fuera del store
export const selectBalance = (state: FinanceState) => state.balance;

export const selectUltimas5 = (state: FinanceState) => {
  return [...state.transacciones]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);
};

export const selectGastosPorCategoria = (state: FinanceState) => {
  const gastos = state.transacciones.filter(t => t.tipo === 'gasto');
  const mapa: Record<string, number> = {};
  
  gastos.forEach(g => { 
    mapa[g.categoria] = (mapa[g.categoria] || 0) + g.monto; 
  });

  return Object.keys(mapa).map(key => ({ 
    x: CATEGORIAS.find(c => c.id === key)?.nombre || key, 
    y: mapa[key] 
  }));
};

export const selectMostFrequentCategory = (state: FinanceState): string => {
  const freq = state.categoriaFrecuencia || {};
  let maxCount = -1;
  let mostFrequent = 'comida'; // default
  Object.entries(freq).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = cat;
    }
  });
  return mostFrequent;
};
