/**
 * ServiceTypeRepository — acesso exclusivo ao banco para o módulo ServiceType.
 *
 * Responsável apenas pela comunicação com o PostgreSQL via Prisma.
 * NÃO contém regras de negócio.
 *
 * Utiliza a instância singleton de `src/lib/prisma.ts`.
 */

import { prisma } from "@/src/lib/prisma";
import type {
  PaginationOptions,
  PaginatedResult,
  ServiceTypePublic,
} from "./service-type.types";

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

export async function findAll(
  options: PaginationOptions = {}
): Promise<PaginatedResult<ServiceTypePublic>> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.serviceType.findMany({
      where: { active: true },
      skip,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.serviceType.count({ where: { active: true } }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function findById(
  id: string
): Promise<ServiceTypePublic | null> {
  return prisma.serviceType.findUnique({ where: { id } });
}
