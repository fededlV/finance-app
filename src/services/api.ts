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
  Ingreso,
  CrearIngresoInput,
  GetIngresosFiltros,
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

type IngresoApi = Omit<Ingreso, 'created_at' | 'updated_at'> & {
  creado_en: string;
  modificado_en?: string | null;
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
  total_ingresado: number;
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

export class NetworkError extends Error {
  originalError?: unknown;
  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class ParsingError extends Error {
  originalError?: unknown;
  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'ParsingError';
    this.originalError = originalError;
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
  if (error instanceof NetworkError || error instanceof ParsingError || error instanceof ApiError) {
    return error;
  }

  if (error instanceof ApiRequestError) {
    if (HANDLED_ERROR_STATUSES.has(error.status)) {
      return new ApiError(error.message, error.status);
    }

    return new ApiError(`Error HTTP ${error.status}: ${error.message}`, error.status);
  }

  if (error instanceof TypeError || error instanceof ReferenceError || error instanceof SyntaxError) {
    return new ParsingError(`Error de ejecución en el cliente: ${(error as Error).message}`, error);
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
  } catch (err) {
    throw new ParsingError('La respuesta del servidor no tiene formato JSON valido.', err);
  }
};

const request = async <T>(
  path: string,
  options: RequestInit,
  mode: RequestMode = 'standard',
): Promise<T> => {
  const baseUrl = getApiBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(options.headers ?? {}),
      },
    });
  } catch (err) {
    throw new NetworkError('No se pudo conectar con el servidor. Verifica tu conexión de red.', err);
  }

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

  if (!payload || !('data' in payload)) {
    throw new ParsingError('La respuesta no incluye la propiedad data esperada.');
  }

  return payload.data;
};

const normalizePeriodo = (periodo: PeriodoApi | null | undefined): Periodo => {
  if (!periodo) {
    return {
      id: 0,
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear(),
      dinero_inicial: 0,
      tipo_cambio_usd: null,
    };
  }
  const { creado_en, ...rest } = periodo;
  return {
    ...rest,
    dinero_inicial: periodo.dinero_inicial ?? 0,
    created_at: creado_en ?? undefined,
  };
};

const normalizeGasto = (gasto: GastoApi | null | undefined): Gasto => ({
  id: gasto?.id ?? 0,
  periodo_id: gasto?.periodo_id ?? 0,
  categoria_id: gasto?.categoria_id ?? 0,
  descripcion: gasto?.descripcion ?? '',
  monto: gasto?.monto ?? 0,
  fecha: gasto?.fecha ?? '',
  nota: gasto?.nota ?? null,
  created_at: gasto?.created_at,
  updated_at: gasto?.updated_at,
});

const normalizeAhorro = (ahorro: AhorroApi | null | undefined): Ahorro => ({
  id: ahorro?.id ?? 0,
  periodo_id: ahorro?.periodo_id ?? 0,
  descripcion: ahorro?.descripcion ?? '',
  monto: ahorro?.monto ?? 0,
  moneda: ahorro?.moneda ?? 'ARS',
  origen: ahorro?.origen ?? null,
  fecha: ahorro?.fecha ?? '',
  nota: ahorro?.nota ?? null,
  created_at: ahorro?.created_at,
  updated_at: ahorro?.updated_at,
});

const normalizeGastoPorCategoria = (gastoCat: GastoPorCategoriaApi | null | undefined): GastoPorCategoria => ({
  categoria_id: gastoCat?.categoria_id ?? 0,
  nombre: gastoCat?.nombre ?? '',
  total: gastoCat?.total ?? 0,
  porcentaje: gastoCat?.porcentaje ?? 0,
});

const normalizePresupuestoEstado = (presupuestoEst: PresupuestoEstadoApi | null | undefined): PresupuestoEstado => ({
  categoria_id: presupuestoEst?.categoria_id ?? 0,
  limite: presupuestoEst?.limite ?? 0,
  gastado: presupuestoEst?.gastado ?? 0,
  porcentaje_usado: presupuestoEst?.porcentaje_usado ?? 0,
});

const normalizeIngreso = (ingreso: IngresoApi | null | undefined): Ingreso => {
  const creado_en = ingreso?.creado_en;
  const modificado_en = ingreso?.modificado_en;
  return {
    id: ingreso?.id ?? 0,
    periodo_id: ingreso?.periodo_id ?? 0,
    descripcion: ingreso?.descripcion ?? '',
    monto: ingreso?.monto ?? 0,
    fecha: ingreso?.fecha ?? '',
    nota: ingreso?.nota ?? null,
    created_at: creado_en ?? undefined,
    updated_at: modificado_en ?? undefined,
  };
};

const normalizeResumen = (resumen: ResumenApi | null | undefined): Resumen => ({
  periodo: normalizePeriodo(resumen?.periodo),
  total_ingresado: resumen?.total_ingresado ?? 0,
  total_gastado: resumen?.total_gastado ?? 0,
  total_ahorrado_ars: resumen?.total_ahorrado_ars ?? 0,
  total_ahorrado_usd: resumen?.total_ahorrado_usd ?? 0,
  saldo_disponible: resumen?.saldo_disponible ?? 0,
  porcentaje_ahorro: resumen?.porcentaje_ahorro ?? 0,
  gastos_por_categoria: (resumen?.gastos_por_categoria ?? []).map(normalizeGastoPorCategoria),
  presupuestos_estado: (resumen?.presupuestos_estado ?? []).map(normalizePresupuestoEstado),
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
        dinero_inicial: data.dinero_inicial,
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
        payload.dinero_inicial = data.dinero_inicial;
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
      return (gastos ?? []).map(normalizeGasto);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async crearGasto(data: CrearGastoInput): Promise<Gasto> {
    try {
      const payload = {
        ...data,
        monto: data.monto,
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
      return (ahorros ?? []).map(normalizeAhorro);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async crearAhorro(data: CrearAhorroInput): Promise<Ahorro> {
    try {
      const payload = {
        ...data,
        monto: data.monto,
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

  async getComparativa(periodoId: number): Promise<any> {
    try {
      return await request<any>(`/resumen/${periodoId}/comparativa`, { method: 'GET' }, 'direct');
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async getIngresos(filtros: GetIngresosFiltros = {}): Promise<Ingreso[]> {
    try {
      const queryString = buildQueryString(filtros as any);
      const ingresos = await request<IngresoApi[]>(`/ingresos${queryString}`, { method: 'GET' });
      return (ingresos ?? []).map(normalizeIngreso);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async crearIngreso(data: CrearIngresoInput): Promise<Ingreso> {
    try {
      const payload = {
        ...data,
        monto: data.monto,
      };

      const ingreso = await request<IngresoApi>(
        '/ingresos',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      return normalizeIngreso(ingreso);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async actualizarGasto(id: number, data: Partial<CrearGastoInput>): Promise<Gasto> {
    try {
      const gasto = await request<GastoApi>(
        `/gastos/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        },
      );
      return normalizeGasto(gasto);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async eliminarGasto(id: number): Promise<void> {
    try {
      await request<void>(`/gastos/${id}`, { method: 'DELETE' }, 'direct');
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async actualizarAhorro(id: number, data: Partial<CrearAhorroInput>): Promise<Ahorro> {
    try {
      const ahorro = await request<AhorroApi>(
        `/ahorros/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        },
      );
      return normalizeAhorro(ahorro);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async eliminarAhorro(id: number): Promise<void> {
    try {
      await request<void>(`/ahorros/${id}`, { method: 'DELETE' }, 'direct');
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async actualizarIngreso(id: number, data: Partial<CrearIngresoInput>): Promise<Ingreso> {
    try {
      const ingreso = await request<IngresoApi>(
        `/ingresos/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        },
      );
      return normalizeIngreso(ingreso);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async eliminarIngreso(id: number): Promise<void> {
    try {
      await request<void>(`/ingresos/${id}`, { method: 'DELETE' }, 'direct');
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async getPeriodos(): Promise<Periodo[]> {
    try {
      const periodos = await request<PeriodoApi[]>('/periodos', { method: 'GET' });
      return (periodos ?? []).map(normalizePeriodo);
    } catch (error) {
      throw toFriendlyError(error);
    }
  },

  async exportarPeriodoExcel(periodoId: number): Promise<string> {
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/transacciones/exportar?periodo_id=${periodoId}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        let errMsg = `Error HTTP ${response.status}`;
        try {
          const jsonBody = await response.json() as any;
          if (jsonBody && typeof jsonBody.error === 'string') {
            errMsg = jsonBody.error;
          }
        } catch {}
        throw new ApiError(errMsg, response.status);
      }

      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const len = bytes.length;
      let base64 = '';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

      for (let i = 0; i < len; i += 3) {
        const b1 = bytes[i];
        const b2 = i + 1 < len ? bytes[i + 1] : 0;
        const b3 = i + 2 < len ? bytes[i + 2] : 0;

        const c1 = b1 >> 2;
        const c2 = ((b1 & 3) << 4) | (b2 >> 4);
        const c3 = ((b2 & 15) << 2) | (b3 >> 6);
        const c4 = b3 & 63;

        base64 += chars[c1] + chars[c2];
        base64 += i + 1 < len ? chars[c3] : '=';
        base64 += i + 2 < len ? chars[c4] : '=';
      }

      return base64;
    } catch (error) {
      throw toFriendlyError(error);
    }
  },
};