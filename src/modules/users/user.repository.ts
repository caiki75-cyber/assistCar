/**
 * UserRepository — acesso exclusivo ao banco de dados para o módulo User.
 *
 * Responsável apenas pela comunicação com o PostgreSQL via Prisma.
 * NÃO contém regras de negócio.
 *
 * Utiliza a instância singleton de `src/lib/prisma.ts`.
 */

import { prisma } from "@/src/lib/prisma";
import type {
  CreateUserData,
  UpdateUserData,
  PaginationOptions,
  PaginatedResult,
  SafeUser,
} from "./user.types";
import type { User } from "@/app/generated/prisma/client";

/** Campos retornados nas consultas públicas (sem passwordHash). */
const safeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

export async function create(data: CreateUserData): Promise<User> {
  return prisma.user.create({ data });
}

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

export async function findById(id: string): Promise<SafeUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: safeSelect,
  });
}

export async function findByIdFull(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findAll(
  options: PaginationOptions = {}
): Promise<PaginatedResult<SafeUser>> {
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 20));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      select: safeSelect,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ---------------------------------------------------------------------------
// UPDATE
// ---------------------------------------------------------------------------

export async function update(
  id: string,
  data: UpdateUserData
): Promise<SafeUser> {
  return prisma.user.update({
    where: { id },
    data,
    select: safeSelect,
  });
}

// ---------------------------------------------------------------------------
// DELETE
// ---------------------------------------------------------------------------

export async function remove(id: string): Promise<SafeUser> {
  return prisma.user.delete({
    where: { id },
    select: safeSelect,
  });
}
