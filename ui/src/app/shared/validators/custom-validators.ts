import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validators for form controls
 */

/**
 * Validates email format
 */
export function emailValidator(): ValidatorFn {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Don't validate empty values (use required validator for that)
    }

    const valid = emailRegex.test(control.value);
    return valid ? null : { email: { value: control.value } };
  };
}

/**
 * Validates maximum length
 */
export function maxLengthValidator(maxLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = String(control.value);
    return value.length <= maxLength
      ? null
      : { maxLength: { requiredLength: maxLength, actualLength: value.length } };
  };
}

/**
 * Validates minimum length
 */
export function minLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = String(control.value);
    return value.length >= minLength
      ? null
      : { minLength: { requiredLength: minLength, actualLength: value.length } };
  };
}

/**
 * Validates that a value is required (not null, undefined, or empty string)
 */
export function requiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    return value !== null && value !== undefined && value !== ''
      ? null
      : { required: true };
  };
}

/**
 * Validates that a number is positive
 */
export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = Number(control.value);
    return !isNaN(value) && value > 0
      ? null
      : { positiveNumber: { value: control.value } };
  };
}

/**
 * Validates that a number is within a range
 */
export function rangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = Number(control.value);
    if (isNaN(value)) {
      return { range: { min, max, value: control.value } };
    }

    return value >= min && value <= max
      ? null
      : { range: { min, max, value } };
  };
}
