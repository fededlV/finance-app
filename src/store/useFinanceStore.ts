/**
 * Propósito: Gestión de estado global de transacciones usando Zustand.
 * Ubicación: src/store/useFinanceStore.ts
 */

import { create } from 'zustand';
import { Transaccion } from '../types';
import { TRANSACCIONES_MOCK, getDatosMesAnterior, CATEGORIAS } from '../mocks/data';

interface FinanceState {
  transacciones: Transaccion[];
  // Acciones
  addTransaccion: (t: Transaccion) => void;
  updateTransaccion: (id: string, updates: Partial<Transaccion>) => void;
  deleteTransaccion: (id: string) => void;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  transacciones: TRANSACCIONES_MOCK,

  addTransaccion: (t) => set((state) => ({ 
    transacciones: [t, ...state.transacciones] 
  })),

  updateTransaccion: (id, updates) => set((state) => ({
    transacciones: state.transacciones.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  deleteTransaccion: (id) => set((state) => ({ 
    transacciones: state.transacciones.filter(t => t.id !== id) 
  })),
}));

// Selectores fuera del store para evitar recreación de objetos en cada render
export const selectBalance = (state: FinanceState) => {
  const t = state.transacciones;
  const ingresos = t.filter(x => x.tipo === 'ingreso').reduce((a, b) => a + b.monto, 0);
  const egresos = t.filter(x => x.tipo === 'gasto').reduce((a, b) => a + b.monto, 0);
  const ahorros = t.filter(x => x.tipo === 'ahorro').reduce((a, b) => a + b.monto, 0);
  return { 
    total: ingresos - egresos, 
    ingresos, 
    egresos, 
    ahorros 
  };
};

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

