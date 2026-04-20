export type ID = number;
export type ISODateString = string;
export type Moneda = "ARS" | "USD";

export interface ApiResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}

export interface Categoria {
  id: ID;
  nombre: string;
  created_at?: string;
  updated_at?: string;
}

export interface Periodo {
  id: ID;
  mes: number;
  anio: number;
  dinero_inicial: number;
  tipo_cambio_usd: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePeriodoInput {
  mes: number;
  anio: number;
  dinero_inicial: number;
  tipo_cambio_usd: number;
}

export interface UpdatePeriodoInput {
  mes?: number;
  anio?: number;
  dinero_inicial?: number;
  tipo_cambio_usd?: number;
}

export interface Gasto {
  id: ID;
  periodo_id: ID;
  categoria_id: ID;
  descripcion: string;
  monto: number;
  fecha: ISODateString;
  nota?: string | null;
  created_at?: string;
  updated_at?: string;
  categoria?: Categoria;
}

export interface GastoFilters {
  periodo_id?: ID;
  categoria_id?: ID;
  fecha_desde?: ISODateString;
  fecha_hasta?: ISODateString;
}

export interface CreateGastoInput {
  periodo_id: ID;
  categoria_id: ID;
  descripcion: string;
  monto: number;
  fecha: ISODateString;
  nota?: string;
}

export interface ReplaceGastoInput {
  periodo_id: ID;
  categoria_id: ID;
  descripcion: string;
  monto: number;
  fecha: ISODateString;
  nota?: string;
}

export interface UpdateGastoInput {
  periodo_id?: ID;
  categoria_id?: ID;
  descripcion?: string;
  monto?: number;
  fecha?: ISODateString;
  nota?: string;
}

export interface Ahorro {
  id: ID;
  periodo_id: ID;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  origen?: string | null;
  fecha: ISODateString;
  nota?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AhorroFilters {
  periodo_id?: ID;
  moneda?: Moneda;
}

export interface CreateAhorroInput {
  periodo_id: ID;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  origen?: string;
  fecha: ISODateString;
  nota?: string;
}

export interface UpdateAhorroInput {
  periodo_id?: ID;
  descripcion?: string;
  monto?: number;
  moneda?: Moneda;
  origen?: string;
  fecha?: ISODateString;
  nota?: string;
}

export interface Presupuesto {
  id: ID;
  periodo_id: ID;
  categoria_id: ID;
  monto_limite: number;
  created_at?: string;
  updated_at?: string;
  categoria?: Categoria;
}

export interface PresupuestoFilters {
  periodo_id?: ID;
}

export interface CreatePresupuestoInput {
  periodo_id: ID;
  categoria_id: ID;
  monto_limite: number;
}

export interface UpdatePresupuestoInput {
  monto_limite?: number;
}

export interface ResumenGastoCategoria {
  categoria_id: ID;
  categoria: string;
  monto: number;
  presupuesto?: number | null;
  restante?: number | null;
  porcentaje_uso?: number | null;
}

export interface ResumenAhorroMoneda {
  moneda: Moneda;
  monto: number;
  cantidad_movimientos?: number;
}

export interface ResumenPeriodo {
  periodo_id: ID;
  dinero_inicial?: number;
  tipo_cambio_usd?: number;
  total_gastos: number;
  total_ahorros: number;
  saldo_actual: number;
  gastos_por_categoria: ResumenGastoCategoria[];
  ahorros_por_moneda: ResumenAhorroMoneda[];
}

export interface ResumenComparativaMetrica {
  actual: number;
  anterior: number | null;
  variacion_abs: number | null;
  variacion_pct: number | null;
}

export interface ResumenComparativa {
  periodo_actual_id: ID;
  periodo_anterior_id: ID | null;
  gastos: ResumenComparativaMetrica;
  ahorros: ResumenComparativaMetrica;
  saldo: ResumenComparativaMetrica;
}
