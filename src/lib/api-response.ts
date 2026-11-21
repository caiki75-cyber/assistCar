/**
 * Utilitário para formatação padronizada de respostas de erro HTTP.
 *
 * Nunca expõe stack traces, credenciais ou detalhes internos ao cliente.
 */

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown
): Response {
  const body: ApiErrorResponse = {
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  };

  return Response.json(body, { status });
}

export function successResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}
