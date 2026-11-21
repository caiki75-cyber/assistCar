/**
 * Route Handler — POST /api/auth/login (autenticar usuário).
 *
 * Verifica se o e-mail existe no banco e se a senha está correta.
 * Retorna erros distintos para "usuário não cadastrado" vs "senha incorreta".
 */

import * as UserService from "@/src/modules/users/user.service";
import { errorResponse, successResponse } from "@/src/lib/api-response";

// ---------------------------------------------------------------------------
// POST /api/auth/login — Autenticar usuário
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    // Validação básica
    if (!body || typeof body !== "object") {
      return errorResponse("VALIDATION_ERROR", "Corpo da requisição inválido.", 400);
    }

    const { email, password } = body as { email?: string; password?: string };

    if (!email || typeof email !== "string" || !email.trim()) {
      return errorResponse("VALIDATION_ERROR", "E-mail é obrigatório.", 400);
    }

    if (!password || typeof password !== "string") {
      return errorResponse("VALIDATION_ERROR", "Senha é obrigatória.", 400);
    }

    // Autenticar
    const user = await UserService.authenticateUser(email, password);

    return successResponse({ user });
  } catch (error) {
    if (error instanceof UserService.UserNotRegisteredError) {
      return errorResponse("USER_NOT_REGISTERED", error.message, 404);
    }

    if (error instanceof UserService.InvalidCredentialsError) {
      return errorResponse("INVALID_CREDENTIALS", error.message, 401);
    }

    console.error("[POST /api/auth/login] Erro inesperado:", (error as Error).message);
    return errorResponse("INTERNAL_ERROR", "Erro interno do servidor.", 500);
  }
}
