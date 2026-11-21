/**
 * Ponto central de acesso ao banco de dados — instância singleton do Prisma Client.
 *
 * Prisma 7 exige um driver adapter explícito (PrismaPg para PostgreSQL).
 * Em desenvolvimento, a instância é armazenada em `globalThis` para
 * sobreviver ao hot-reload do Next.js sem criar conexões duplicadas.
 *
 * Todos os repositories DEVEM importar `prisma` daqui.
 * Nunca crie `new PrismaClient()` em outro lugar.
 */

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/src/config/env";

function createPrismaClient(): InstanceType<typeof PrismaClient> {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
