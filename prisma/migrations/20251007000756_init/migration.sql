-- CreateEnum
CREATE TYPE "TarefaStatus" AS ENUM ('Iniciado', 'Coleta_De_Informações', 'Execucao', 'Aprovação_Cliente', 'Concluído', 'Encerrado', 'Protocolado');

-- CreateEnum
CREATE TYPE "TipoRelatorio" AS ENUM ('impressao', 'excel');

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "numero" INTEGER,
    "bairro" TEXT,
    "razao_social" TEXT,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contato_principal" TEXT NOT NULL,
    "contato_secundario" TEXT,
    "proposta_link" TEXT,
    "cnpj" TEXT NOT NULL,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_servico" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "orgao" TEXT,

    CONSTRAINT "tipo_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servico" (
    "id" SERIAL NOT NULL,
    "tipo_servico" INTEGER NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefa" (
    "id" SERIAL NOT NULL,
    "tipo_servico" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "status" "TarefaStatus" NOT NULL DEFAULT 'Iniciado',
    "data_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prazo_final" TIMESTAMP(3),
    "observacoes" TEXT,
    "valor_total_servico" DECIMAL(65,30),

    CONSTRAINT "tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_status_tarefa" (
    "id" SERIAL NOT NULL,
    "tarefa_id" INTEGER NOT NULL,
    "status" "TarefaStatus" NOT NULL,
    "data_mudanca" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_status_tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etapa" (
    "id" SERIAL NOT NULL,
    "tarefa_id" INTEGER NOT NULL,
    "nome_etapa" TEXT NOT NULL,
    "data_etapa" TIMESTAMP(3),
    "status_etapa" BOOLEAN NOT NULL DEFAULT false,
    "observacoes_etapa" TEXT,

    CONSTRAINT "etapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suporte" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor_hora" DECIMAL(65,30) NOT NULL DEFAULT 75.00,
    "data_suporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora_inicio" TIMESTAMP(3) NOT NULL,
    "hora_fim" TIMESTAMP(3),
    "tempo_suporte" DECIMAL(65,30),
    "valor_total" DECIMAL(65,30),

    CONSTRAINT "suporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relatorio" (
    "id" SERIAL NOT NULL,
    "tarefa_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "descricao_relatorio" TEXT NOT NULL,
    "data_relatorio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo_relatorio" "TipoRelatorio" NOT NULL,
    "filtro" TEXT,

    CONSTRAINT "relatorio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenca" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "validade" TIMESTAMP(3),
    "observacao" TEXT,

    CONSTRAINT "licenca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_servico_nome_key" ON "tipo_servico"("nome");

-- CreateIndex
CREATE INDEX "servico_tipo_servico_idx" ON "servico"("tipo_servico");

-- CreateIndex
CREATE INDEX "tarefa_tipo_servico_idx" ON "tarefa"("tipo_servico");

-- CreateIndex
CREATE INDEX "tarefa_cliente_id_idx" ON "tarefa"("cliente_id");

-- CreateIndex
CREATE INDEX "historico_status_tarefa_tarefa_id_idx" ON "historico_status_tarefa"("tarefa_id");

-- CreateIndex
CREATE INDEX "historico_status_tarefa_data_mudanca_tarefa_id_idx" ON "historico_status_tarefa"("data_mudanca", "tarefa_id");

-- CreateIndex
CREATE INDEX "etapa_tarefa_id_idx" ON "etapa"("tarefa_id");

-- CreateIndex
CREATE INDEX "suporte_cliente_id_idx" ON "suporte"("cliente_id");

-- CreateIndex
CREATE INDEX "relatorio_tarefa_id_idx" ON "relatorio"("tarefa_id");

-- CreateIndex
CREATE INDEX "relatorio_cliente_id_idx" ON "relatorio"("cliente_id");

-- CreateIndex
CREATE INDEX "licenca_cliente_id_idx" ON "licenca"("cliente_id");

-- AddForeignKey
ALTER TABLE "servico" ADD CONSTRAINT "servico_tipo_servico_fkey" FOREIGN KEY ("tipo_servico") REFERENCES "tipo_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_tipo_servico_fkey" FOREIGN KEY ("tipo_servico") REFERENCES "tipo_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_status_tarefa" ADD CONSTRAINT "historico_status_tarefa_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "etapa" ADD CONSTRAINT "etapa_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suporte" ADD CONSTRAINT "suporte_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio" ADD CONSTRAINT "relatorio_tarefa_id_fkey" FOREIGN KEY ("tarefa_id") REFERENCES "tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorio" ADD CONSTRAINT "relatorio_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenca" ADD CONSTRAINT "licenca_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
