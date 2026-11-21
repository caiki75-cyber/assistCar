/**
 * Route Handler — GET, PATCH, DELETE /api/users/[id].
 *
 * Operações sobre um usuário específico, identificado por UUID.
 */

import type { NextRequest } from "next/server";
import { validateUpdateUserDTO } from "@/src/modules/users/user.dto";
import * as UserService from "@/src/modules/users/user.service";
import { errorResponse, successResponse } from "@/src/lib/api-response";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RouteParams = { params: Promise<{ id: string }> };

function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
}

// ---------------------------------------------------------------------------
// GET /api/users/[id] — Buscar usuário
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("INVALID_ID", "ID inválido.", 400);
    }

    const user = await UserService.getUserById(id);
    return successResponse(user);
  } catch (error) {
    if (error instanceof UserService.UserNotFoundError) {
      return errorResponse("USER_NOT_FOUND", error.message, 404);
    }

    console.error("[GET /api/users/:id] Erro inesperado:", (error as Error).message);
    return errorResponse("INTERNAL_ERROR", "Erro interno do servidor.", 500);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/users/[id] — Atualizar usuário
// ---------------------------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("INVALID_ID", "ID inválido.", 400);
    }

    const body = await req.json();

    const validation = validateUpdateUserDTO(body);
    if (!validation.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Dados inválidos.",
        400,
        validation.errors
      );
    }

    const user = await UserService.updateUser(id, validation.data!);
    return successResponse(user);
  } catch (error) {
    if (error instanceof UserService.UserNotFoundError) {
      return errorResponse("USER_NOT_FOUND", error.message, 404);
    }
    if (error instanceof UserService.EmailAlreadyExistsError) {
      return errorResponse("EMAIL_ALREADY_EXISTS", error.message, 409);
    }

    console.error("[PATCH /api/users/:id] Erro inesperado:", (error as Error).message);
    return errorResponse("INTERNAL_ERROR", "Erro interno do servidor.", 500);
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/users/[id] — Excluir usuário
// ---------------------------------------------------------------------------

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
): Promise<Response> {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return errorResponse("INVALID_ID", "ID inválido.", 400);
    }

    const user = await UserService.deleteUser(id);
    return successResponse(user);
  } catch (error) {
    if (error instanceof UserService.UserNotFoundError) {
      return errorResponse("USER_NOT_FOUND", error.message, 404);
    }

    console.error("[DELETE /api/users/:id] Erro inesperado:", (error as Error).message);
    return errorResponse("INTERNAL_ERROR", "Erro interno do servidor.", 500);
  }
}

