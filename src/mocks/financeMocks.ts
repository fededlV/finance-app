import { Gasto, Resumen, Ahorro } from '../types/finance';

export const MOCK_RESUMEN: Resumen = {
  periodo_id: 1,
  dinero_inicial: 50000000, // $500,000.00
  total_gastos: 15000000,   // $150,000.00
  total_ahorros_ars: 5000000, // $50,000.00
  total_ahorros_usd: 100,     // $100.00
  total_ahorros_usd_en_ars: 12000000, // $120,000.00 (ejemplo TC 1200)
  saldo_final: 35000000,    // $350,000.00
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
