import { Gasto, Resumen, Ahorro } from '../types/finance';

export const MOCK_RESUMEN: Resumen = {
  periodo: {
    id: 1,
    mes: 5,
    anio: 2026,
    dinero_inicial: 500000, // $500,000.00
    tipo_cambio_usd: 1200,
    created_at: '2026-05-01T10:00:00Z',
  },
  total_ingresado: 500000,
  total_gastado: 150000, // $150,000.00
  total_ahorrado_ars: 50000, // $50,000.00
  total_ahorrado_usd: 100, // $100.00
  saldo_disponible: 300000, // $300,000.00
  porcentaje_ahorro: 25.0,
  gastos_por_categoria: [
    {
      categoria_id: 1,
      nombre: 'Comida',
      total: 45000,
      porcentaje: 30,
    },
    {
      categoria_id: 2,
      nombre: 'Hogar',
      total: 15000,
      porcentaje: 10,
    },
  ],
  presupuestos_estado: [
    {
      categoria_id: 1,
      limite: 100000,
      gastado: 45000,
      porcentaje_usado: 45,
    },
  ],
};

export const MOCK_GASTOS: Gasto[] = [
  {
    id: 1,
    periodo_id: 1,
    categoria_id: 1,
    descripcion: 'Supermercado Coto',
    monto: 4500000, // $45,000.00
    fecha: '2026-05-01',
  },
  {
    id: 2,
    periodo_id: 1,
    categoria_id: 2,
    descripcion: 'Pago Internet',
    monto: 1500000, // $15,000.00
    fecha: '2026-05-03',
  },
  {
    id: 3,
    periodo_id: 1,
    categoria_id: 3,
    descripcion: 'Cena Sushi',
    monto: 2500000, // $25,000.00
    fecha: '2026-05-05',
  },
  {
    id: 4,
    periodo_id: 1,
    categoria_id: 4,
    descripcion: 'Gimnasio',
    monto: 800000,  // $8,000.00
    fecha: '2026-05-06',
  },
];

export const CATEGORY_ICONS: Record<string | number, string> = {
  1: 'shopping-cart',
  2: 'wifi',
  3: 'coffee',
  4: 'heart',
  default: 'credit-card',
};
