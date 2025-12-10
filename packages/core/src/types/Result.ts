/**
 * FILE: packages/core/src/types/Result.ts
 * PURPOSE: Rust-style Result and Option types for type-safe error handling
 * AUTHOR: ChipaTrade Core Team
 * DEPENDENCIES: None (zero dependencies)
 * 
 * DESCRIPTION:
 * Implements Result<T, E> and Option<T> patterns to eliminate null/undefined
 * and exception-based error handling. Forces explicit error handling at compile time.
 */

/**
 * Result type representing either success (Ok) or failure (Err)
 * @template T - The type of the success value
 * @template E - The type of the error (defaults to Error)
 */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Option type representing presence (Some) or absence (None) of a value
 * @template T - The type of the value when present
 */
export type Option<T> =
  | { readonly some: true; readonly value: T }
  | { readonly some: false };

/**
 * Creates a successful Result
 */
export function Ok<T, E = Error>(value: T): Result<T, E> {
  return { ok: true, value };
}

/**
 * Creates a failed Result
 */
export function Err<T, E = Error>(error: E): Result<T, E> {
  return { ok: false, error };
}

/**
 * Creates an Option with a value
 */
export function Some<T>(value: T): Option<T> {
  return { some: true, value };
}

/**
 * Creates an empty Option
 */
export function None<T>(): Option<T> {
  return { some: false };
}

/**
 * Unwraps a Result, throwing if it's an error
 * USE SPARINGLY - prefer pattern matching
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
}

/**
 * Unwraps an Option, throwing if it's None
 * USE SPARINGLY - prefer pattern matching
 */
export function unwrapOption<T>(option: Option<T>): T {
  if ('some' in option && option.some) {
    return option.value;
  }
  throw new Error('Attempted to unwrap None');
}

/**
 * Maps a Result's success value to a new value
 */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  return result.ok ? Ok(fn(result.value)) : result;
}

/**
 * Maps an Option's value to a new value
 */
export function mapOption<T, U>(
  option: Option<T>,
  fn: (value: T) => U
): Option<U> {
  return 'some' in option && option.some ? Some(fn(option.value)) : None();
}

/**
 * Provides a default value for an Option if it's None
 */
export function unwrapOr<T>(option: Option<T>, defaultValue: T): T {
  return 'some' in option && option.some ? option.value : defaultValue;
}

/**
 * Converts Option to Result with provided error for None case
 */
export function optionToResult<T, E>(
  option: Option<T>,
  error: E
): Result<T, E> {
  return 'some' in option && option.some ? Ok(option.value) : Err(error);
}
