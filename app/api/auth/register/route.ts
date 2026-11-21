/**
 * Route Handler — POST /api/auth/register (criar conta).
 *
 * Cria um novo usuário no banco de dados.
 * Retorna o usuário criado (sem passwordHash) para o frontend
 * redirecionar ao login.
 */

import { validateCreateUserDTO } from "@/src/modules/users/user.dto";
import * as UserService from "@/src/modules/users/user.service";
import { errorResponse, successResponse } from "@/src/lib/api-response";

// ---------------------------------------------------------------------------
// POST /api/auth/register — Cadastrar novo usuário
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    // Validar DTO
    const validation = validateCreateUserDTO(body);
    if (!validation.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Dados inválidos.",
        400,
        validation.errors
      );
    }

    // Criar usuário
    const user = await UserService.createUser(validation.data!);

    return successResponse({ user }, 201);
  } catch (error) {
    if (error instanceof UserService.EmailAlreadyExistsError) {
      return errorResponse("EMAIL_ALREADY_EXISTS", error.message, 409);
    }

    console.error("[POST /api/auth/register] Erro inesperado:", (error as Error).message);
    return errorResponse("INTERNAL_ERROR", "Erro interno do servidor.", 500);
  }
}
