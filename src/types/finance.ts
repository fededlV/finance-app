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

export interface GastoPorCategoria {
  categoria_id: number;
  nombre: string;
  total: number;
  porcentaje: number;
}

export interface PresupuestoEstado {
  categoria_id: number;
  limite: number;
  gastado: number;
  porcentaje_usado: number;
}

export interface Resumen {
  periodo: Periodo;
  total_ingresado: number;
  total_gastado: number;
  total_ahorrado_ars: number;
  total_ahorrado_usd: number;
  saldo_disponible: number;
  porcentaje_ahorro: number;
  gastos_por_categoria: GastoPorCategoria[];
  presupuestos_estado: PresupuestoEstado[];
}

export interface Ingreso {
  id: number;
  periodo_id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  nota?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CrearIngresoInput {
  periodo_id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  nota?: string;
}

export interface GetIngresosFiltros {
  periodo_id?: number;
}

export interface CrearPeriodoInput {
  mes: number;
  anio: number;
  dinero_inicial: number;
  tipo_cambio_usd?: number | null;
}

export interface ActualizarPeriodoInput {
  dinero_inicial?: number;
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

export interface ComparativaItem {
  id: number;
  mes: number;
  anio: number;
  total_gastado: number;
  total_ahorrado_ars: number;
}

export interface ResumenComparativa {
  periodo_actual: ComparativaItem;
  periodo_anterior: ComparativaItem;
  variacion_gastos_pct: number;
  variacion_ahorros_pct: number;
}