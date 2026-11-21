/**
 * Tipos do domínio ServiceType, derivados do schema Prisma.
 *
 * Re-exporta os tipos gerados e define tipos auxiliares
 * usados internamente pelo service e repository.
 */

import type { ServiceType as PrismaServiceType } from "@/app/generated/prisma/client";

export type { PrismaServiceType };

/** ServiceType público — retornado nas respostas HTTP. */
export type ServiceTypePublic = PrismaServiceType;

/** Opções de paginação para listagem. */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/** Resultado paginado. */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
