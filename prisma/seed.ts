/**
 * Seed — dados iniciais de tipos de serviço para desenvolvimento.
 *
 * Os serviços correspondem ao catálogo descrito na documentação:
 * pneu furado, bateria, combustível, chaveiro, guincho e mecânica.
 *
 * Executar com: npx prisma db seed
 */

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const serviceTypes = [
  {
    name: "Pneu furado",
    description: "Troca ou reparo de pneu no local",
    icon: "🛞",
    basePrice: 8000,
  },
  {
    name: "Bateria",
    description: "Recarga ou troca de bateria automotiva",
    icon: "🔋",
    basePrice: 10000,
  },
  {
    name: "Combustível",
    description: "Entrega de combustível emergencial",
    icon: "⛽",
    basePrice: 6000,
  },
  {
    name: "Chaveiro",
    description: "Abertura de portas e cópia de chaves",
    icon: "🔑",
    basePrice: 12000,
  },
  {
    name: "Guincho",
    description: "Reboque do veículo até oficina ou destino",
    icon: "🚛",
    basePrice: 15000,
  },
  {
    name: "Mecânica",
    description: "Diagnóstico e reparo mecânico no local",
    icon: "🔧",
    basePrice: 9000,
  },
];

async function main() {
  console.log("🌱 Inserindo tipos de serviço...");

  for (const st of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { name: st.name },
      update: {
        description: st.description,
        icon: st.icon,
        basePrice: st.basePrice,
      },
      create: st,
    });
    console.log(`  ✓ ${st.name}`);
  }

  console.log("✅ Seed concluído.");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
