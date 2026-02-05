
import { ExtractedData, ValidationResult, ValidationError } from '../types';

const VALID_CURRENCIES = ['MAD', 'USD', 'EUR'];

/**
 * TypeScript implementation of "The Judge" for trade compliance.
 */
export const validateTradeData = (data: ExtractedData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Rule 1: Mathematical Check (Quantity * Unit Price == montant_total)
  const items = data.items || [];
  const calculatedTotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  const reportedTotal = data.montant_total || 0;

  if (Math.abs(calculatedTotal - reportedTotal) > 0.01) {
    errors.push({
      field: 'montant_total',
      message: `Total amount mismatch. Calculated ${calculatedTotal.toFixed(2)}, but invoice says ${reportedTotal.toFixed(2)}.`,
      severity: 'warning'
    });
  }

  // Rule 2: HS Code Format (At least 6 digits)
  items.forEach((item, idx) => {
    const hs = (item.hs_code || '').trim();
    if (hs.length < 6) {
      errors.push({
        field: `items[${idx}].hs_code`,
        message: `Invalid HS Code for '${item.description}'. Must be at least 6 digits.`,
        severity: 'error'
      });
    }
  });

  // Rule 3: Currency Validation
  const devise = (data.devise || '').toUpperCase();
  if (!VALID_CURRENCIES.includes(devise)) {
    errors.push({
      field: 'devise',
      message: `Invalid currency '${devise}'. Must be one of ${VALID_CURRENCIES.join(', ')}.`,
      severity: 'error'
    });
  }

  // Rule 4: Mandatory Fields
  if (!data.vendeur) errors.push({ field: 'vendeur', message: 'Seller name is mandatory', severity: 'error' });
  if (!data.acheteur) errors.push({ field: 'acheteur', message: 'Buyer name is mandatory', severity: 'error' });

  return {
    is_valid: errors.every(e => e.severity !== 'error'),
    errors
  };
};
