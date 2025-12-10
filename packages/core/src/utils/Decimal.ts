/**
 * FILE: packages/core/src/utils/Decimal.ts
 * PURPOSE: Decimal arithmetic utilities using decimal.js
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: decimal.js
 * 
 * DESCRIPTION:
 * Wrapper around decimal.js for precise financial calculations.
 * All monetary operations must use these functions to avoid floating-point errors.
 */

import DecimalJS from 'decimal.js';
import type { Decimal } from '../types/Order';
import type { Result } from '../types/Result';
import { Ok, Err } from '../types/Result';
import { ValidationError } from '../types/Errors';

// Configure decimal.js for financial precision
DecimalJS.set({
  precision: 36,
  rounding: DecimalJS.ROUND_DOWN,
  toExpNeg: -18,
  toExpPos: 18,
});

/**
 * Creates a Decimal from string with validation
 */
export function createDecimal(value: string): Result<Decimal, ValidationError> {
  try {
    const decimal = new DecimalJS(value);
    if (!decimal.isFinite()) {
      return Err(new ValidationError('value', 'Must be a finite number'));
    }
    return Ok(decimal.toString() as Decimal);
  } catch (error) {
    return Err(new ValidationError('value', `Invalid decimal: ${error instanceof Error ? error.message : 'unknown'}`));
  }
}

/**
 * Adds two decimals
 */
export function add(a: Decimal, b: Decimal): Decimal {
  return new DecimalJS(a).plus(b).toString() as Decimal;
}

/**
 * Subtracts b from a
 */
export function subtract(a: Decimal, b: Decimal): Decimal {
  return new DecimalJS(a).minus(b).toString() as Decimal;
}

/**
 * Multiplies two decimals
 */
export function multiply(a: Decimal, b: Decimal): Decimal {
  return new DecimalJS(a).times(b).toString() as Decimal;
}

/**
 * Divides a by b
 */
export function divide(a: Decimal, b: Decimal): Result<Decimal, ValidationError> {
  if (isZero(b)) {
    return Err(new ValidationError('divisor', 'Cannot divide by zero'));
  }
  return Ok(new DecimalJS(a).dividedBy(b).toString() as Decimal);
}

/**
 * Compares two decimals
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compare(a: Decimal, b: Decimal): -1 | 0 | 1 {
  const result = new DecimalJS(a).comparedTo(b);
  return result as -1 | 0 | 1;
}

/**
 * Checks if a > b
 */
export function isGreaterThan(a: Decimal, b: Decimal): boolean {
  return new DecimalJS(a).greaterThan(b);
}

/**
 * Checks if a >= b
 */
export function isGreaterThanOrEqual(a: Decimal, b: Decimal): boolean {
  return new DecimalJS(a).greaterThanOrEqualTo(b);
}

/**
 * Checks if a < b
 */
export function isLessThan(a: Decimal, b: Decimal): boolean {
  return new DecimalJS(a).lessThan(b);
}

/**
 * Checks if a <= b
 */
export function isLessThanOrEqual(a: Decimal, b: Decimal): boolean {
  return new DecimalJS(a).lessThanOrEqualTo(b);
}

/**
 * Checks if a === b
 */
export function isEqual(a: Decimal, b: Decimal): boolean {
  return new DecimalJS(a).equals(b);
}

/**
 * Checks if value is zero
 */
export function isZero(value: Decimal): boolean {
  return new DecimalJS(value).isZero();
}

/**
 * Checks if value is positive
 */
export function isPositive(value: Decimal): boolean {
  return new DecimalJS(value).greaterThan(0);
}

/**
 * Checks if value is negative
 */
export function isNegative(value: Decimal): boolean {
  return new DecimalJS(value).lessThan(0);
}

/**
 * Returns absolute value
 */
export function abs(value: Decimal): Decimal {
  return new DecimalJS(value).abs().toString() as Decimal;
}

/**
 * Returns maximum of two decimals
 */
export function max(a: Decimal, b: Decimal): Decimal {
  return DecimalJS.max(a, b).toString() as Decimal;
}

/**
 * Returns minimum of two decimals
 */
export function min(a: Decimal, b: Decimal): Decimal {
  return DecimalJS.min(a, b).toString() as Decimal;
}

/**
 * Rounds decimal to specified precision
 */
export function round(value: Decimal, decimalPlaces: number): Decimal {
  return new DecimalJS(value).toDecimalPlaces(decimalPlaces).toString() as Decimal;
}

/**
 * Converts decimal to number (USE CAREFULLY - may lose precision)
 */
export function toNumber(value: Decimal): number {
  return new DecimalJS(value).toNumber();
}

/**
 * Creates a decimal from number (USE CAREFULLY - may lose precision)
 */
export function fromNumber(value: number): Decimal {
  return new DecimalJS(value).toString() as Decimal;
}

/**
 * Constant decimal values
 */
export const ZERO: Decimal = '0' as Decimal;
export const ONE: Decimal = '1' as Decimal;
export const NEGATIVE_ONE: Decimal = '-1' as Decimal;
