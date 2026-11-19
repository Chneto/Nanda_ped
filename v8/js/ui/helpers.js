/**
 * Finanças Pediatria /v8/ - Utilitários puros da UI (sem DOM)
 * Criado por: FChNeto (APP_CREATOR = 'FChNeto')
 */

/**
 * Sanitiza strings para inserção segura no DOM (Previne DOM XSS)
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Calcula o próximo índice de foco dentro de um diálogo (focus trap circular).
 * Retorna null quando o navegador deve seguir o Tab natural.
 */
export function nextFocusIndex(count, current, backwards = false) {
  if (!count) return null;
  if (current < 0) return backwards ? count - 1 : 0; // foco fora do diálogo: traz para dentro
  if (backwards && current === 0) return count - 1;
  if (!backwards && current === count - 1) return 0;
  return null;
}
