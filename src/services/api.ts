import type {
  Ahorro,
  ApiErrorResponse,
  ApiSuccessResponse,
  CrearAhorroInput,
  CrearGastoInput,
  CrearPeriodoInput,
  ActualizarPeriodoInput,
  Gasto,
  GetGastosFiltros,
  Periodo,
  Resumen,
  GastoPorCategoria,
  PresupuestoEstado,
} from '../types/finance';

const HANDLED_ERROR_STATUSES = new Set([400, 404, 409, 422, 500]);
const MONEY_FACTOR = 100;

type RequestMode = 'standard' | 'direct';

type PeriodoApi = Omit<Periodo, 'dinero_inicial' | 'created_at' | 'updated_at'> & {
  dinero_inicial: number;
  creado_en: string;
};

type GastoApi = Omit<Gasto, 'monto'> & {
  monto: number;
};

type AhorroApi = Omit<Ahorro, 'monto'> & {
  monto: number;
};

type GastoPorCategoriaApi = Omit<GastoPorCategoria, 'total'> & {
  total: number;
};

type PresupuestoEstadoApi = Omit<PresupuestoEstado, 'limite' | 'gastado'> & {
  limite: number;
  gastado: number;
};

type ResumenApi = {
  periodo: PeriodoApi;
  total_gastado: number;
  total_ahorrado_ars: number;
  total_ahorrado_usd: number;
  saldo_disponible: number;
  porcentaje_ahorro: number;
  gastos_por_categoria: GastoPorCategoriaApi[];
  presupuestos_estado: PresupuestoEstadoApi[];
};

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class ApiRequestError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

const getApiBaseUrl = (): string => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!baseUrl) {
    throw new Error('Configura EXPO_PUBLIC_API_URL para conectar la app con el backend.');
  }

  return baseUrl.replace(/\/+$/, '');
};



const toCents = (value: number): number => Math.round(value * MONEY_FACTOR);
const fromCents = (value: number): number => value / MONEY_FACTOR;

const toFriendlyError = (error: unknown): Error => {
  if (error instanceof ApiRequestError) {
    if (HANDLED_ERROR_STATUSES.has(error.status)) {
      return new ApiError(error.message, error.status);
    }

    return new ApiError(`Error HTTP ${error.status}: ${error.message}`, error.status);
  }

  if (error instanceof Error) {
    return error;
  }

  return new ApiError('Error inesperado al consumir la API.');
};

const buildQueryString = (query?: GetGastosFiltros): string => {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
};

const parseJsonBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiRequestError('La respuesta del servidor no tiene formato JSON valido.', response.status);
  }
};

const request = async <T>(
  path: string,
  options: RequestInit,
  mode: RequestMode = 'standard',
): Promise<T> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const jsonBody = await parseJsonBody(response);

  if (!response.ok) {
    const payload = (jsonBody ?? {}) as ApiErrorResponse;
    const message = typeof payload.error === 'string' ? payload.error : `Error HTTP ${response.status}`;
    throw new ApiRequestError(message, response.status, payload.details);
  }

  if (mode === 'direct') {
    return jsonBody as T;
  }

  const payload = (jsonBody ?? {}) as ApiSuccessResponse<T>;

  if (!('data' in payload)) {
    throw new ApiRequestError('La respuesta no incluye la propiedad data esperada.', response.status);
  }

  return payload.data;
};

const normalizePeriodo = (periodo: PeriodoApi): Periodo => {
  const { creado_en, ...rest } = periodo;
  return {
    ...rest,
    dinero_inicial: fromCents(periodo.dinero_inicial),
    created_at: creado_en,
  };
};

const normalizeGasto = (gasto: GastoApi): Gasto => ({
  ...gasto,
  monto: fromCents(gasto.monto),
});

const normalizeAhorro = (ahorro: AhorroApi): Ahorro => ({
  ...ahorro,
  monto: fromCents(ahorro.monto),
});

const normalizeGastoPorCategoria = (gastoCat: GastoPorCategoriaApi): GastoPorCategoria => ({
  ...gastoCat,
  total: fromCents(gastoCat.total),
});

const normalizePresupuestoEstado = (presupuestoEst: PresupuestoEstadoApi): PresupuestoEstado => ({
  ...presupuestoEst,
  limite: fromCents(presupuestoEst.limite),
  gastado: fromCents(presupuestoEst.gastado),
});

const normalizeResumen = (resumen: ResumenApi): Resumen => ({
  periodo: normalizePeriodo(resumen.periodo),
  total_gastado: fromCents(resumen.total_gastado),
  total_ahorrado_ars: fromCents(resumen.total_ahorrado_ars),
  total_ahorrado_usd: fromCents(resumen.total_ahorrado_usd),
  saldo_disponible: fromCents(resumen.saldo_disponible),
  porcentaje_ahorro: resumen.porcentaje_ahorro,
  gastos_por_categoria: resumen.gastos_por_categoria.map(normalizeGastoPorCategoria),
  presupuestos_estado: resumen.presupuestos_estado.map(normalizePresupuestoEstado),
});

export const api = {
  async getPeriodoActual(): Promise<Periodo> {
    try {
      const periodo = await request<PeriodoApi>('/periodos/actual', { method: 'GET' });
      return normalizePeriodo(periodo);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async crearPeriodo(data: CrearPeriodoInput): Promise<Periodo> {
    try {
      const payload = {
        ...data,
        dinero_inicial: toCents(data.dinero_inicial),
      };

      const periodo = await request<PeriodoApi>(
        '/periodos',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      return normalizePeriodo(periodo);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async actualizarPeriodo(id: number, data: ActualizarPeriodoInput): Promise<Periodo> {
    try {
      const payload: any = {};
      if (data.dinero_inicial !== undefined) {
        payload.dinero_inicial = toCents(data.dinero_inicial);
      }
      if (data.tipo_cambio_usd !== undefined) {
        payload.tipo_cambio_usd = data.tipo_cambio_usd;
      }

      const periodo = await request<PeriodoApi>(
        `/periodos/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
        },
      );

      return normalizePeriodo(periodo);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async getGastos(filtros: GetGastosFiltros = {}): Promise<Gasto[]> {
    try {
      const queryString = buildQueryString(filtros);
      const gastos = await request<GastoApi[]>(`/gastos${queryString}`, { method: 'GET' });
      return gastos.map(normalizeGasto);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async crearGasto(data: CrearGastoInput): Promise<Gasto> {
    try {
      const payload = {
        ...data,
        monto: toCents(data.monto),
      };

      const gasto = await request<GastoApi>(
        '/gastos',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      return normalizeGasto(gasto);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async getAhorros(): Promise<Ahorro[]> {
    try {
      const ahorros = await request<AhorroApi[]>('/ahorros', { method: 'GET' });
      return ahorros.map(normalizeAhorro);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async crearAhorro(data: CrearAhorroInput): Promise<Ahorro> {
    try {
      const payload = {
        ...data,
        monto: toCents(data.monto),
      };

      const ahorro = await request<AhorroApi>(
        '/ahorros',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      return normalizeAhorro(ahorro);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async getResumen(periodo_id: number): Promise<Resumen> {
    try {
      const resumen = await request<ResumenApi>(`/resumen/${periodo_id}`, { method: 'GET' }, 'direct');
      return normalizeResumen(resumen);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },
};