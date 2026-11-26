/**
 * Route Handler — POST /api/historico (registrar pedido de assistência).
 *
 * O nome e o preço do serviço vêm do banco, nunca do cliente.
 */

import { prisma } from "@/src/lib/prisma";
import { errorResponse, successResponse } from "@/src/lib/api-response";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => null);

    const serviceTypeId = text(body?.serviceTypeId);
    const veiculo = text(body?.veiculo);
    const endereco = text(body?.endereco);
    const userId = text(body?.userId);

    if (!UUID.test(serviceTypeId)) {
      return errorResponse("VALIDATION_ERROR", "Serviço inválido.", 400);
    }
    if (!veiculo || veiculo.length > 200) {
      return errorResponse("VALIDATION_ERROR", "Veículo é obrigatório (máx. 200 caracteres).", 400);
    }
    if (!endereco || endereco.length > 300) {
      return errorResponse("VALIDATION_ERROR", "Endereço é obrigatório (máx. 300 caracteres).", 400);
    }

    const service = await prisma.serviceType.findUnique({ where: { id: serviceTypeId } });
    if (!service || !service.active) {
      return errorResponse("SERVICE_NOT_FOUND", "Serviço não disponível.", 404);
    }

    // Vincula ao usuário somente se ele existir
    const user = UUID.test(userId)
      ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
      : null;

    const registrar = await prisma.historico.create({
      data: {
        userId: user?.id ?? null,
        serviceTypeId: service.id,
        servico: service.name,
        preco: service.basePrice,
        veiculo,
        endereco,
      },
    });

    return successResponse({ historico: registrar }, 201);
  } catch (error) {
    console.error("[POST /api/historico] Erro inesperado:", (error as Error).message);
    return errorResponse("INTERNAL_ERROR", "Erro interno do servidor.", 500);
  }
}
