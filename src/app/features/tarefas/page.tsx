"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Plus, X } from "lucide-react";
import { Atividade } from "@/types/atividade";
import { AtividadeCard } from "./components/AtividadeCard";
import { AtividadeModal } from "./components/AtividadeModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

export default function Page() {
  const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtrosStatus, setFiltrosStatus] = useState<string[]>([]);
  const [filtrosTipo, setFiltrosTipo] = useState<string[]>([]);

  const handleAtividadeClick = (atividade: Atividade) => {
    setSelectedAtividade(atividade);
    setModalOpen(true);
  };

  // Funções de filtro
  const toggleFiltroStatus = (status: string) => {
    setFiltrosStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };
  const toggleFiltroTipo = (tipo: string) => {
    setFiltrosTipo(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  };
  const removerFiltro = (tipo: 'status' | 'tipo', valor: string) => {
    if (tipo === 'status') {
      setFiltrosStatus(prev => prev.filter(s => s !== valor));
    } else {
      setFiltrosTipo(prev => prev.filter(t => t !== valor));
    }
  };
  const limparFiltros = () => {
    setFiltrosStatus([]);
    setFiltrosTipo([]);
  };

  // Opções de filtro
  const statusOptions = [
    { value: "pendente", label: "Pendente" },
    { value: "em_andamento", label: "Em Andamento" },
    { value: "concluido", label: "Concluído" }
  ];
  const tipoOptions = [
    { value: "Licença Provisória", label: "Licença Provisória" },
    { value: "Renovação", label: "Renovação" },
    { value: "Certificado", label: "Certificado" },
    { value: "Licença", label: "Licença" }
  ];
  const temFiltrosAtivos = filtrosStatus.length > 0 || filtrosTipo.length > 0;

  // Filtragem das atividades
  const atividadesFiltradas = mockAtividades.filter(atividade => {
    const statusMatch = filtrosStatus.length === 0 || filtrosStatus.includes(atividade.status);
    const tipoMatch = filtrosTipo.length === 0 || filtrosTipo.includes(atividade.tipo);
    return statusMatch && tipoMatch;
  });

  return (
    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Atividades</h1>
            <p className="text-muted-foreground">Gerencie todas as atividades</p>
          </div>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild className="bg-white">
                <Button variant="outline" className="gap-2 px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-amber-400 hover:text-black hover:border-black">
                  <Filter className="h-4 w-4" />
                  Filtrar Atividades
                  {temFiltrosAtivos && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {filtrosStatus.length + filtrosTipo.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white" align="start">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Status</h4>
                    <div className="space-y-2">
                      {statusOptions.map(option => (
                        <div key={option.value} className="flex items-center gap-2">
                          <Checkbox
                            id={`status-${option.value}`}
                            checked={filtrosStatus.includes(option.value)}
                            onCheckedChange={() => toggleFiltroStatus(option.value)}
                          />
                          <Label
                            htmlFor={`status-${option.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Tipo</h4>
                    <div className="space-y-2">
                      {tipoOptions.map(option => (
                        <div key={option.value} className="flex items-center gap-2">
                          <Checkbox
                            id={`tipo-${option.value}`}
                            checked={filtrosTipo.includes(option.value)}
                            onCheckedChange={() => toggleFiltroTipo(option.value)}
                          />
                          <Label
                            htmlFor={`tipo-${option.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {temFiltrosAtivos && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={limparFiltros}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" className="px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {temFiltrosAtivos && (
          <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg border">
            <span className="text-sm font-medium text-muted-foreground">Filtros ativos:</span>
            {filtrosStatus.map(status => (
              <Badge key={status} variant="secondary" className="gap-1 pl-2 pr-1">
                {statusOptions.find(s => s.value === status)?.label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removerFiltro('status', status)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {filtrosTipo.map(tipo => (
              <Badge key={tipo} variant="secondary" className="gap-1 pl-2 pr-1">
                {tipo}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removerFiltro('tipo', tipo)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="h-6 text-xs"
            >
              Limpar todos
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {atividadesFiltradas.map((atividade) => (
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
