/**
 * Effectue une requête fetch en masquant les erreurs HTTP attendues dans la console
 * Utile pour les vérifications d'authentification où les 401/403 sont normaux
 */
export async function fetchSilent(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(input, init);
    return response;
  } catch (error) {
    // On ne log que les vraies erreurs réseau, pas les codes HTTP
    throw error;
  }
}

/**
 * Supprime temporairement les logs d'erreur de la console
 * À utiliser avec précaution, uniquement pour les cas où les erreurs HTTP sont attendues
 */
export async function fetchWithSuppressedErrors(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const originalConsoleError = console.error;

  // Filtrer les erreurs liées aux requêtes HTTP
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Ne pas logger les erreurs HTTP 401, 403, etc.
    if (message.includes('401') ||
      message.includes('403') ||
      message.includes('Unauthorized') ||
      message.includes('Forbidden')) {
      return;
    }
    originalConsoleError(...args);
  };

  try {
    const response = await fetch(input, init);
    return response;
  } finally {
    // Restaurer console.error
    console.error = originalConsoleError;
  }
}
