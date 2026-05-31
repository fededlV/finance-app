/**
 * Utilidades para el manejo de moneda y conversiones.
 * Factor de conversión: 100 (centavos).
 */

import { Moneda } from '../types/finance';

const MONEY_FACTOR = 100;

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
 * Formatea montos en centavos a una representación visible para UI en formato argentino.
 * @param cents Monto en centavos (ej: 432050)
 * @returns Monto formateado (ej: "4.320,50")
 */
export const formatArgentineNumber = (cents: number): string => {
  const value = cents / MONEY_FACTOR;
  // Obtenemos el signo y el valor absoluto
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  
  const parts = absValue.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Agregar punto para los miles
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${isNegative ? '-' : ''}${integerPart},${decimalPart}`;
};

/**
 * Parsea un string formateado en ARS a centavos enteros.
 * @param displayValue String formateado (ej: "4.320,50")
 * @returns Monto en centavos (ej: 432050)
 */
export const parseArgentineToCents = (displayValue: string): number => {
  // Quitamos todos los puntos y reemplazamos la coma por punto
  const cleaned = displayValue.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * MONEY_FACTOR);
};

/**
 * Aplica una máscara en tiempo real para inputs de montos locales (Formato ARS).
 * @param text Texto ingresado (ej: "4320,50")
 * @returns Texto enmascarado (ej: "4.320,50")
 */
export const maskArgentineInput = (text: string): string => {
  // Quitar todo lo que no sea dígito o coma
  let cleaned = text.replace(/[^0-9,]/g, '');

  // Evitar múltiples comas
  const commaCount = (cleaned.match(/,/g) || []).length;
  if (commaCount > 1) {
    const parts = cleaned.split(',');
    cleaned = parts[0] + ',' + parts.slice(1).join('');
  }

  // Separar parte entera y decimal
  const parts = cleaned.split(',');
  let integerPart = parts[0];
  let decimalPart = parts[1] !== undefined ? parts[1] : '';

  // Limitar decimales a 2 dígitos
  if (decimalPart.length > 2) {
    decimalPart = decimalPart.slice(0, 2);
  }

  // Quitar ceros a la izquierda innecesarios
  if (integerPart.length > 1 && integerPart.startsWith('0')) {
    integerPart = integerPart.replace(/^0+/, '');
  }
  if (integerPart === '') {
    integerPart = '0';
  }

  // Aplicar formato de miles
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  if (parts.length > 1) {
    return `${formattedInteger},${decimalPart}`;
  }
  return formattedInteger;
};

/**
 * Formatea montos en centavos con el prefijo de la moneda correspondiente.
 */
export const formatMoney = (
  cents: number,
  currency: Moneda = 'ARS',
): string => {
  const symbol = currency === 'USD' ? 'US$' : '$';
  return `${symbol} ${formatArgentineNumber(cents)}`;
};
