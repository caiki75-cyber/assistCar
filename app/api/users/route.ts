/**
 * Route Handler — POST /api/users (criar) e GET /api/users (listar).
 *
 * O controller não contém regras de negócio.
 * Apenas valida entrada via DTO, chama o service e retorna resposta HTTP.
 */

import { validateCreateUserDTO } from "@/src/modules/users/user.dto";
import * as UserService from "@/src/modules/users/user.service";
import { errorResponse, successResponse } from "@/src/lib/api-response";

// ---------------------------------------------------------------------------
// POST /api/users — Cadastrar usuário
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

    // Chamar service
    const user = await UserService.createUser(validation.data!);

    return successResponse(user, 201);
  } catch (error) {
    if (error instanceof UserService.EmailAlreadyExistsError) {
      return errorResponse("EMAIL_ALREADY_EXISTS", error.message, 409);
    }

    console.error("[POST /api/users] Erro inesperado:", (error as Error).message);
    return errorResponse(
      "INTERNAL_ERROR",
      "Erro interno do servidor.",
      500
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/users — Listar usuários (paginado)
// ---------------------------------------------------------------------------

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const result = await UserService.listUsers({ page, limit });

    return successResponse(result);
  } catch (error) {
    console.error("[GET /api/users] Erro inesperado:", (error as Error).message);
    return errorResponse(
      "INTERNAL_ERROR",
      "Erro interno do servidor.",
      500
    );
  }
}
