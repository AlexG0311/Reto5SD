import { validateSelectOnly } from '../validator.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class QueryValidator {
  validate(sql: string): ValidationResult {
    try {
      validateSelectOnly(sql);
      return { valid: true, errors: [] };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { valid: false, errors: [message] };
    }
  }
}
