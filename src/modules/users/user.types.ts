/**
 * Tipos do domínio User, derivados do schema Prisma.
 *
 * Re-exporta os tipos gerados e define tipos auxiliares
 * usados internamente pelo service e repository.
 */

import type { User as PrismaUser } from "@/app/generated/prisma/client";

export type { PrismaUser };

/** Usuário sem campos sensíveis — retornado nas respostas HTTP. */
export type SafeUser = Omit<PrismaUser, "passwordHash">;

/** Dados recebidos pelo repository para criação. */
export interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role?: PrismaUser["role"];
}

/** Dados recebidos pelo repository para atualização. */
export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  role?: PrismaUser["role"];
}

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
