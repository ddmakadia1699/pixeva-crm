/**
 * Formats a numeric currency value into a deterministic USD string ($XXX,XXX)
 * avoiding locale-dependent React hydration mismatch errors.
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0';
  }
  return '$' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
