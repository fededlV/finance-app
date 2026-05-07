import type {
  Ahorro,
  ApiErrorResponse,
  ApiSuccessResponse,
  CrearAhorroInput,
  CrearGastoInput,
  CrearPeriodoInput,
  Gasto,
  GetGastosFiltros,
  Periodo,
  Resumen,
  ResumenCategoria,
} from '../types/finance';

const HANDLED_ERROR_STATUSES = new Set([400, 404, 409, 422, 500]);
const MONEY_FACTOR = 100;

type RequestMode = 'standard' | 'direct';

type PeriodoApi = Omit<Periodo, 'dinero_inicial'> & {
  dinero_inicial: number;
};

type GastoApi = Omit<Gasto, 'monto'> & {
  monto: number;
};

type AhorroApi = Omit<Ahorro, 'monto'> & {
  monto: number;
};

type ResumenCategoriaApi = Omit<ResumenCategoria, 'monto_gastado' | 'monto_presupuestado' | 'monto_restante'> & {
  monto_gastado: number;
  monto_presupuestado?: number | null;
  monto_restante?: number | null;
};

type ResumenApi = {
  periodo_id: number;
  dinero_inicial: number;
  total_gastos: number;
  total_ahorros_ars: number;
  total_ahorros_usd: number;
  total_ahorros_usd_en_ars: number;
  saldo_final: number;
  presupuestos?: ResumenCategoriaApi[];
  [key: string]: unknown;
};

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
      return new Error(error.message);
    }

    return new Error(`Error HTTP ${error.status}: ${error.message}`);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('Error inesperado al consumir la API.');
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

const normalizePeriodo = (periodo: PeriodoApi): Periodo => ({
  ...periodo,
  dinero_inicial: fromCents(periodo.dinero_inicial),
});

const normalizeGasto = (gasto: GastoApi): Gasto => ({
  ...gasto,
  monto: fromCents(gasto.monto),
});

const normalizeAhorro = (ahorro: AhorroApi): Ahorro => ({
  ...ahorro,
  monto: fromCents(ahorro.monto),
});

const normalizeResumenCategoria = (categoria: ResumenCategoriaApi): ResumenCategoria => ({
  ...categoria,
  monto_gastado: fromCents(categoria.monto_gastado),
  monto_presupuestado:
    typeof categoria.monto_presupuestado === 'number' ? fromCents(categoria.monto_presupuestado) : categoria.monto_presupuestado,
  monto_restante: typeof categoria.monto_restante === 'number' ? fromCents(categoria.monto_restante) : categoria.monto_restante,
});

const normalizeResumen = (resumen: ResumenApi): Resumen => ({
  ...resumen,
  dinero_inicial: fromCents(resumen.dinero_inicial),
  total_gastos: fromCents(resumen.total_gastos),
  total_ahorros_ars: fromCents(resumen.total_ahorros_ars),
  total_ahorros_usd: fromCents(resumen.total_ahorros_usd),
  total_ahorros_usd_en_ars: fromCents(resumen.total_ahorros_usd_en_ars),
  saldo_final: fromCents(resumen.saldo_final),
  presupuestos: resumen.presupuestos?.map(normalizeResumenCategoria),
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