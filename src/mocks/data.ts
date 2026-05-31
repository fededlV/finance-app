/**
 * Propósito: Proveer datos de prueba y funciones de utilidad para la gestión de finanzas en memoria.
 * Ubicación: src/mocks/data.ts
 */

import { Transaccion, TipoTransaccion } from '../types';

export const CATEGORIAS = [
  { id: 'comida', nombre: 'Comida', icon: 'fast-food' },
  { id: 'transporte', nombre: 'Transporte', icon: 'bus' },
  { id: 'hogar', nombre: 'Hogar', icon: 'home' },
  { id: 'salud', nombre: 'Salud', icon: 'medical' },
  { id: 'ocio', nombre: 'Ocio', icon: 'game-controller' },
  { id: 'trabajo', nombre: 'Trabajo', icon: 'briefcase' },
  { id: 'educacion', nombre: 'Educación', icon: 'book' },
  { id: 'ahorro', nombre: 'Ahorro', icon: 'wallet' },
  { id: 'otro', nombre: 'Otro', icon: 'add-circle' },
];

export const TRANSACCIONES_MOCK: Transaccion[] = [
  { id: '1', tipo: 'ingreso', categoria: 'trabajo', descripcion: 'Sueldo Mayo', monto: 120000000, fecha: '2026-05-01' },
  { id: '2', tipo: 'gasto', categoria: 'hogar', descripcion: 'Alquiler Depto', monto: 35000000, fecha: '2026-05-02' },
  { id: '3', tipo: 'gasto', categoria: 'comida', descripcion: 'Supermercado Coto', monto: 4500000, fecha: '2026-05-03' },
  { id: '4', tipo: 'ahorro', categoria: 'ahorro', descripcion: 'Compra USD MEP', monto: 10000000, fecha: '2026-05-04' },
  { id: '5', tipo: 'gasto', categoria: 'transporte', descripcion: 'Carga SUBE', monto: 1200000, fecha: '2026-05-05' },
  { id: '6', tipo: 'gasto', categoria: 'salud', descripcion: 'Farmacia', monto: 850000, fecha: '2026-05-07' },
  { id: '7', tipo: 'gasto', categoria: 'ocio', descripcion: 'Netflix', monto: 650000, fecha: '2026-05-08' },
  { id: '8', tipo: 'ingreso', categoria: 'otro', descripcion: 'Venta de monitor viejo', monto: 12000000, fecha: '2026-05-10' },
  { id: '9', tipo: 'gasto', categoria: 'comida', descripcion: 'Cena Sushi', monto: 2200000, fecha: '2026-05-12' },
  { id: '10', tipo: 'gasto', categoria: 'educacion', descripcion: 'Curso React Native', monto: 3500000, fecha: '2026-05-15' },
  { id: '11', tipo: 'ahorro', categoria: 'ahorro', descripcion: 'Plazo Fijo', monto: 5000000, fecha: '2026-05-18' },
  { id: '12', tipo: 'gasto', categoria: 'transporte', descripcion: 'Nafta', monto: 4000000, fecha: '2026-05-20' },
  { id: '13', tipo: 'gasto', categoria: 'comida', descripcion: 'Almuerzo oficina', monto: 750000, fecha: '2026-05-22' },
  { id: '14', tipo: 'gasto', categoria: 'hogar', descripcion: 'Expensas', monto: 6000000, fecha: '2026-05-25' },
  { id: '15', tipo: 'gasto', categoria: 'ocio', descripcion: 'Cine y cena', monto: 1800000, fecha: '2026-05-28' },
];

export const getBalance = () => {
  const ingresos = TRANSACCIONES_MOCK
    .filter(t => t.tipo === 'ingreso')
    .reduce((acc, curr) => acc + curr.monto, 0);
  
  const egresos = TRANSACCIONES_MOCK
    .filter(t => t.tipo === 'gasto')
    .reduce((acc, curr) => acc + curr.monto, 0);

  const ahorros = TRANSACCIONES_MOCK
    .filter(t => t.tipo === 'ahorro')
    .reduce((acc, curr) => acc + curr.monto, 0);

  return {
    total: ingresos - egresos,
    ingresos,
    egresos,
    ahorros
  };
};

export const getUltimas5 = () => {
  return [...TRANSACCIONES_MOCK]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);
};

export const getGastosPorCategoria = () => {
  const gastos = TRANSACCIONES_MOCK.filter(t => t.tipo === 'gasto');
  const mapa: Record<string, number> = {};

  gastos.forEach(g => {
    mapa[g.categoria] = (mapa[g.categoria] || 0) + g.monto;
  });

  return Object.keys(mapa).map(key => ({
    x: CATEGORIAS.find(c => c.id === key)?.nombre || key,
    y: mapa[key]
  }));
};

// Simulación de datos del mes anterior para comparación
export const getDatosMesAnterior = () => {
  return {
    gastos: 62000000, 
    ahorros: 12000000,
  };
};
