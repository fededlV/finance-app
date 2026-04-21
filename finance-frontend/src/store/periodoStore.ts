import { create } from 'zustand';
import type { Periodo } from '../types/models';

interface PeriodoStore {
  periodo: Periodo | null;
  setPeriodo: (periodo: Periodo) => void;
  clearPeriodo: () => void;
}

export const usePeriodoStore = create<PeriodoStore>((set) => ({
  periodo: null,
  setPeriodo: (periodo) => set({ periodo }),
  clearPeriodo: () => set({ periodo: null }),
}));
