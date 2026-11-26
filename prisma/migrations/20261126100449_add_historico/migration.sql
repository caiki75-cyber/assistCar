-- CreateTable
CREATE TABLE "historico" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "service_type_id" UUID NOT NULL,
    "servico" TEXT NOT NULL,
    "preco" INTEGER NOT NULL,
    "veiculo" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historico_user_id_idx" ON "historico"("user_id");

-- AddForeignKey
ALTER TABLE "historico" ADD CONSTRAINT "historico_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
