/**
 * Route Handler — GET /api/service-types (listar serviços disponíveis).
 *
 * O controller não contém regras de negócio.
 * Apenas chama o service e retorna resposta HTTP.
 */

import * as ServiceTypeService from "@/src/modules/service-types/service-type.service";
import { errorResponse, successResponse } from "@/src/lib/api-response";

// ---------------------------------------------------------------------------
// GET /api/service-types — Listar tipos de serviço ativos
// ---------------------------------------------------------------------------

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    const result = await ServiceTypeService.listServiceTypes({ page, limit });

    return successResponse(result);
  } catch (error) {
    console.error(
      "[GET /api/service-types] Erro inesperado:",
      (error as Error).message
    );
    return errorResponse("INTERNAL_ERROR", "Erro interno do servidor.", 500);
  }
}
