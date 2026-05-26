/**
 * Utilidades para el manejo de moneda y conversiones.
 * Factor de conversión: 100 (centavos).
 */

import { Moneda } from '../types/finance';

const MONEY_FACTOR = 100;
const LOCALE = 'es-AR';

/**
 * Convierte un monto decimal a enteros (centavos).
 * @param amount Monto en formato decimal (ej: 10.50)
 * @returns Monto en centavos (ej: 1050)
 */
export const toCents = (amount: number): number => Math.round(amount * MONEY_FACTOR);

/**
 * Convierte un monto en centavos a formato decimal.
 * @param cents Monto en centavos (ej: 1050)
 * @returns Monto en formato decimal (ej: 10.50)
 */
export const fromCents = (cents: number): number => cents / MONEY_FACTOR;

/**
 * Formatea montos en centavos a una representación visible para UI.
 */
export const formatMoney = (
  cents: number,
  currency: Moneda = 'ARS',
  options: Intl.NumberFormatOptions = {},
): string => {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    ...options,
  }).format(fromCents(cents));
};
