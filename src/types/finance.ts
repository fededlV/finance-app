export type Moneda = 'ARS' | 'USD';

export interface Periodo {
  id: number;
  mes: number;
  anio: number;
  dinero_inicial: number;
  tipo_cambio_usd: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Gasto {
  id: number;
  periodo_id: number;
  categoria_id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  nota?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Ahorro {
  id: number;
  periodo_id: number;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  origen?: string | null;
  fecha: string;
  nota?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Presupuesto {
  id: number;
  periodo_id: number;
  categoria_id: number;
  monto_limite: number;
  created_at?: string;
  updated_at?: string;
}

export interface ResumenCategoria {
  categoria_id: number;
  categoria?: string;
  monto_gastado: number;
  monto_presupuestado?: number | null;
  monto_restante?: number | null;
}

export interface Resumen {
  periodo_id: number;
  dinero_inicial: number;
  total_gastos: number;
  total_ahorros_ars: number;
  total_ahorros_usd: number;
  total_ahorros_usd_en_ars: number;
  saldo_final: number;
  presupuestos?: ResumenCategoria[];
  [key: string]: unknown;
}

export interface CrearPeriodoInput {
  mes: number;
  anio: number;
  dinero_inicial: number;
  tipo_cambio_usd?: number | null;
}

export interface CrearGastoInput {
  periodo_id: number;
  categoria_id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  nota?: string;
}

export interface CrearAhorroInput {
  periodo_id: number;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  origen?: string;
  fecha: string;
  nota?: string;
}

export interface GetGastosFiltros {
  periodo_id?: number;
  categoria_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}