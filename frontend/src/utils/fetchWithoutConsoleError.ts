/**
 * apiFetch — utilitaire centralisé pour tous les appels API.
 *
 * Stratégie pour éviter les erreurs dans la console du navigateur :
 *   • Les endpoints sensibles (auth status, login, logout) sont wrappés
 *     côté nginx et retournent TOUJOURS HTTP 200 ; l'erreur est dans le
 *     champ `error` du corps JSON.
 *   • Pour tous les autres endpoints, la détection d'erreur se fait via
 *     le corps JSON (`result.error`) et non via `response.status`, ce qui
 *     permet de centraliser la logique et de faciliter la migration.
 *
 * Usage :
 *   const { data, error, status } = await apiFetch("/api/auth/status");
 *   if (error) { … } else { use data }
 */

export type ApiFetchResult<T = Record<string, unknown>> = {
  /** Corps JSON de la réponse (null si parsing impossible) */
  data: T | null;
  /** Valeur du champ `error` si présent, sinon null */
  error: string | null;
  /** Valeur du champ `message` si présent, sinon null */
  message: string | null;
  /** Code HTTP réel reçu par le navigateur */
  status: number;
};

export async function apiFetch<T = Record<string, unknown>>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiFetchResult<T>> {
  try {
    const response = await fetch(input, {
      credentials: "include",
      ...init,
    });

    let data: T | null = null;
    try {
      data = (await response.json()) as T;
    } catch {
      // Réponse sans corps (ex : 204)
    }

    const errorField = (data as any)?.error ?? null;
    const messageField = (data as any)?.message ?? null;

    // Si la réponse HTTP est une erreur ET qu'il n'y a pas de champ error
    // dans le corps, on fabrique un error générique.
    const error: string | null =
      errorField ?? (!response.ok ? `http_${response.status}` : null);

    return { data, error, message: messageField, status: response.status };
  } catch (networkError) {
    // Vraie erreur réseau (pas de connexion, DNS, etc.)
    return {
      data: null,
      error: "network_error",
      message: null,
      status: 0,
    };
  }
}
