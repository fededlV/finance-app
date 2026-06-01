/**
 * Propósito: Definición de interfaces TypeScript para el dominio de la aplicación.
 * Ubicación: src/types/index.ts
 */

export type TipoTransaccion = 'gasto' | 'ingreso' | 'ahorro';

export interface Transaccion {
  id: string;
  tipo: TipoTransaccion;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string; // Formato ISO 8601 (YYYY-MM-DD)
  moneda?: 'ARS' | 'USD';
  origen?: string | null;
  montoOriginal?: number;
}

export interface CategoriaInfo {
  id: string;
  nombre: string;
  icon: string;
}
