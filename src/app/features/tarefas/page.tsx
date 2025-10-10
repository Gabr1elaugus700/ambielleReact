"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, Plus, Package } from "lucide-react";
import { Atividade } from "@/types/atividade";
import { AtividadeCard } from "./components/AtividadeCard";
import { AtividadeModal } from "./components/AtividadeModal";

// Mock data baseado na imagem
const mockAtividades: Atividade[] = [
  {
    id: "1",
    empresa: "MEDIUM LNMPS",
    tipo: "Licença Provisória",
    prazo_final: "2024-01-25",
    valor_sn: "SEM INFORMAÇÃO",
    retencao: "CERTIFICADO ISS 07/2023 - 06/2024",
    servico: "LICENÇA PROVISÓRIA",
    status: "pendente",
    cor: "laranja",
  },
  {
    id: "2",
    empresa: "FAZIM E CIA LTDA",
    tipo: "Licença Provisória",
    prazo_final: "2024-01-25",
    valor_sn: "SEM INFORMAÇÃO",
    retencao: "LICENÇA PROVISÓRIA",
    servico: "NOTA FISCAL",
    status: "em_andamento",
    cor: "verde",
  },
  {
    id: "3",
    empresa: "ALI CHAN INDUSTRIA E COMERCIO LTDA",
    tipo: "Renovação",
    prazo_final: "2024-01-30",
    valor_sn: "INFORMADO",
    retencao: "SIMPLES NACIONAL",
    servico: "LICENÇA PROVISÓRIA",
    status: "em_andamento",
    cor: "azul",
  },
  {
    id: "4",
    empresa: "TECH SOLUTIONS LTDA",
    tipo: "Certificado",
    prazo_final: "2024-02-01",
    valor_sn: "INFORMADO",
    retencao: "CERTIFICADO ISS 07/2023 - 06/2024",
    servico: "LICENÇA SANITÁRIA",
    status: "pendente",
    cor: "roxo",
  },
  {
    id: "5",
    empresa: "COMERCIAL ABC",
    tipo: "Licença",
    prazo_final: "2024-01-28",
    valor_sn: "INFORMADO",
    retencao: "SIMPLES NACIONAL",
    servico: "NOTA FISCAL",
    status: "em_andamento",
    cor: "amarelo",
  },
  {
    id: "6",
    empresa: "BRUNO LNMPS",
    tipo: "Renovação",
    prazo_final: "2024-02-05",
    valor_sn: "INFORMADO",
    retencao: "LICENÇA PROVISÓRIA",
    servico: "NOTA FISCAL ESPECIAL",
    status: "concluido",
    cor: "vermelho",
  },
];

export default function Atividades() {
  const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAtividadeClick = (atividade: Atividade) => {
    setSelectedAtividade(atividade);
    setModalOpen(true);
  };

  return (
    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Atividades</h1>
          <p className="text-muted-foreground">Gerencie todas as atividades</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtrar Atividades
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
          <Button variant="secondary" className="gap-2">
            <Package className="h-4 w-4" />
            Materiais
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockAtividades.map((atividade) => (
          <AtividadeCard
            key={atividade.id}
            atividade={atividade}
            onClick={() => handleAtividadeClick(atividade)}
          />
        ))}
      </div>

      <AtividadeModal
        atividade={selectedAtividade}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
    </main>
  );
}
