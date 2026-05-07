/**
 * Propósito: Gestión de estado global de transacciones usando Zustand.
 * Ubicación: src/store/useFinanceStore.ts
 */

import { create } from 'zustand';
import { Transaccion } from '../types';
import { TRANSACCIONES_MOCK, getBalance, getUltimas5, getGastosPorCategoria, getDatosMesAnterior } from '../mocks/data';

interface FinanceState {
  transacciones: Transaccion[];
  // Selectores derivados (computados)
  getBalance: () => ReturnType<typeof getBalance>;
  getUltimas5: () => Transaccion[];
  getGastosPorCategoria: () => ReturnType<typeof getGastosPorCategoria>;
  getDatosMesAnterior: () => ReturnType<typeof getDatosMesAnterior>;
  // Acciones
  addTransaccion: (t: Transaccion) => void;
  deleteTransaccion: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transacciones: TRANSACCIONES_MOCK,

  getBalance: () => {
    const t = get().transacciones;
    const ingresos = t.filter(x => x.tipo === 'ingreso').reduce((a, b) => a + b.monto, 0);
    const egresos = t.filter(x => x.tipo === 'gasto').reduce((a, b) => a + b.monto, 0);
    const ahorros = t.filter(x => x.tipo === 'ahorro').reduce((a, b) => a + b.monto, 0);
    return { total: ingresos - egresos, ingresos, egresos, ahorros };
  },

  getUltimas5: () => {
    return [...get().transacciones]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  },

  getGastosPorCategoria: () => {
    const gastos = get().transacciones.filter(t => t.tipo === 'gasto');
    const mapa: Record<string, number> = {};
    gastos.forEach(g => { mapa[g.categoria] = (mapa[g.categoria] || 0) + g.monto; });
    return Object.keys(mapa).map(key => ({ x: key, y: mapa[key] }));
  },

  getDatosMesAnterior: () => getDatosMesAnterior(),

  addTransaccion: (t) => set((state) => ({ 
    transacciones: [t, ...state.transacciones] 
  })),

  deleteTransaccion: (id) => set((state) => ({ 
    transacciones: state.transacciones.filter(t => t.id !== id) 
  })),
}));
