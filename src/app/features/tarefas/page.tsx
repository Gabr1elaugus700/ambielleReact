"use client";

import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
  
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Plus, X } from "lucide-react";
import { Atividade } from "@/types/atividade";
import { AtividadeCard } from "./components/AtividadeCard";
import { AtividadeModal } from "./components/AtividadeModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ModalTarefa } from "./components/ModalCreateTarefa";
import { TarefaInput } from "./api";
import { toast } from "sonner";
import { useTarefas } from "./hooks";
import { Tarefa, TarefaStatus } from "./api";

// Tipos para API com relacionamentos
type TarefaCompleta = Tarefa & {
  cliente: { nome: string; razao_social?: string; };
  tipoServico: { nome: string; orgao?: string; };
};

// Função para mapear status para cores
const getCorPorStatus = (status: TarefaStatus): "laranja" | "verde" | "azul" | "amarelo" | "roxo" | "vermelho" => {
  switch (status) {
    case "Iniciado":
      return "azul";
    case "Coleta_De_Informações":
      return "amarelo";
    case "Execucao":
      return "laranja";
    case "Aprovação_Cliente":
      return "roxo";
    case "Concluído":
      return "verde";
    case "Encerrado":
      return "vermelho";
    case "Protocolado":
      return "verde";
    default:
      return "azul";
  }
};

// Função para mapear status da tarefa para status da atividade
const mapearStatusParaAtividade = (statusTarefa: TarefaStatus): "pendente" | "em_andamento" | "concluido" => {
  switch (statusTarefa) {
    case "Iniciado":
    case "Coleta_De_Informações":
      return "pendente";
    case "Execucao":
    case "Aprovação_Cliente":
      return "em_andamento";
    case "Concluído":
    case "Protocolado":
      return "concluido";
    case "Encerrado":
      return "concluido";
    default:
      return "pendente";
  }
};

// Função para converter Tarefa para Atividade (compatibilidade com o componente)
const tarefaParaAtividade = (tarefa: TarefaCompleta): Atividade => {
  const formatarData = (data: string | Date) => {
    try {
      if (!data) return "Não definido";
      
      // Se for string, criar Date object
      const dataObj = typeof data === 'string' ? new Date(data) : data;
      
      // Verificar se a data é válida
      if (isNaN(dataObj.getTime())) return "Data inválida";
      
      return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    } catch {
      return "Data inválida";
    }
  };

  const formatarValor = (valor: number | string) => {
    try {
      const numericValue = typeof valor === 'string' ? parseFloat(valor) : valor;
      if (isNaN(numericValue) || numericValue === 0) return "SEM INFORMAÇÃO";
      return `R$ ${numericValue.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })}`;
    } catch {
      return "SEM INFORMAÇÃO";
    }
  };

  return {
    id: tarefa.id.toString(),
    empresa: tarefa.cliente?.nome || "Cliente não informado",
    tipo: tarefa.tipoServico?.nome || "Tipo não informado",
    data_inicio: formatarData(tarefa.data_inicio),
    prazo_final: formatarData(tarefa.prazo_final),
    valor_sn: formatarValor(tarefa.valor_total_servico || 0),
    observacao: tarefa.observacoes || "SEM OBSERVAÇÃO", 
    servico: tarefa.status || "Status não informado", // Aqui colocamos o status real da tarefa
    status: mapearStatusParaAtividade(tarefa.status),
    cor: getCorPorStatus(tarefa.status),
  };
};

export default function Page() {
  useAuthGuard();
  const { tarefas, isLoading, isError, create, update } = useTarefas();
  const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [filtrosStatus, setFiltrosStatus] = useState<string[]>([]);
  const [filtrosTipo, setFiltrosTipo] = useState<string[]>([]);

  // Converter tarefas para atividades
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const atividades: Atividade[] = (tarefas || []).map((tarefa: any) => tarefaParaAtividade(tarefa));

  const [modalTarefaOpen, setModalTarefaOpen] = useState(false);

  const handleTarefaClick = () => {
    setModalTarefaOpen(true);
  };

  const handleSaveTarefa = async (data: TarefaInput) => {
    try {
      await create(data);
      console.log("Salvando tarefa:", data);
      setModalTarefaOpen(false);
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      toast.error("Erro ao salvar tarefa");
    }
  };

  const handleAtividadeClick = (atividade: Atividade) => {
    setSelectedAtividade(atividade);
    setModalOpen(true);
  };

  const handleUpdateAtividade = async (id: string, dadosAtividade: Partial<Atividade>) => {
    try {
      // Converter os dados da atividade para o formato da API
      const dadosTarefa = {
        valor_total_servico: dadosAtividade.valor_sn?.replace(/[R$\s.,]/g, '') ? parseFloat(dadosAtividade.valor_sn.replace(/[R$\s.,]/g, '')) : undefined,
        observacoes: dadosAtividade.observacao,
        status: dadosAtividade.servico as TarefaStatus, // Status da tarefa
        data_inicio: dadosAtividade.data_inicio ? converterDataParaISO(dadosAtividade.data_inicio) : undefined,
        prazo_final: dadosAtividade.prazo_final ? converterDataParaISO(dadosAtividade.prazo_final) : undefined,
      };

      // Remover campos undefined
      const dadosLimpos = Object.fromEntries(
        Object.entries(dadosTarefa).filter(([, value]) => value !== undefined)
      );

      await update(parseInt(id), dadosLimpos);
      toast.success("Atividade atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      throw error;
    }
  };

  // Função auxiliar para converter data de DD/MM/YYYY para YYYY-MM-DD
  const converterDataParaISO = (data: string): string => {
    if (!data) return "";
    const partes = data.split('/');
    if (partes.length === 3) {
      return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
    return data;
  };

  // Funções de filtro
  const toggleFiltroStatus = (status: string) => {
    setFiltrosStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };
  const toggleFiltroTipo = (tipo: string) => {
    setFiltrosTipo((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };
  const removerFiltro = (tipo: "status" | "tipo", valor: string) => {
    if (tipo === "status") {
      setFiltrosStatus((prev) => prev.filter((s) => s !== valor));
    } else {
      setFiltrosTipo((prev) => prev.filter((t) => t !== valor));
    }
  };
  const limparFiltros = () => {
    setFiltrosStatus([]);
    setFiltrosTipo([]);
  };

  // Função para formatar o texto do status (mesma do AtividadeCard)
  const formatarStatusTexto = (status: string) => {
    switch (status) {
      case "Coleta_de_Informações":
        return "Coleta de Informações";
      case "Execucao":
        return "Execução";
      case "Aprovação_Cliente":
        return "Aprovação Cliente";
      default:
        return status;
    }
  };

  // Opções de filtro baseadas nos status reais das tarefas
  const statusReaisUnicos = [...new Set(atividades.map(a => a.servico))].filter(Boolean);
  const statusOptions = statusReaisUnicos.map(status => ({
    value: status,
    label: formatarStatusTexto(status)
  }));
  
  // Gerar opções de tipo baseado nas tarefas reais
  const tiposUnicos = [...new Set(atividades.map(a => a.tipo))];
  const tipoOptions = tiposUnicos.map(tipo => ({
    value: tipo,
    label: tipo
  }));
  const temFiltrosAtivos = filtrosStatus.length > 0 || filtrosTipo.length > 0;

  // Filtragem das atividades
  const atividadesFiltradas = atividades.filter((atividade) => {
    const statusMatch =
      filtrosStatus.length === 0 || filtrosStatus.includes(atividade.servico);
    const tipoMatch =
      filtrosTipo.length === 0 || filtrosTipo.includes(atividade.tipo);
    return statusMatch && tipoMatch;
  });

  // Mostrar loading
  if (isLoading) {
    return (
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Atividades</h1>
              <p className="text-muted-foreground">Carregando tarefas...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Mostrar erro
  if (isError) {
    return (
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Atividades</h1>
              <p className="text-red-600">Erro ao carregar tarefas. Tente novamente.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Atividades</h1>
            <p className="text-muted-foreground">
              Gerencie todas as atividades
            </p>
          </div>
          <div className="flex gap-3">
            <Popover>
              <PopoverTrigger asChild className="bg-white">
                <Button
                  variant="outline"
                  className="gap-2 px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-amber-400 hover:text-black hover:border-black"
                >
                  <Filter className="h-4 w-4" />
                  Filtrar Atividades
                  {temFiltrosAtivos && (
                    <Badge
                      variant="secondary"
                      className="ml-1 px-1.5 py-0 text-xs"
                    >
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
                      {statusOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`status-${option.value}`}
                            checked={filtrosStatus.includes(option.value)}
                            onCheckedChange={() =>
                              toggleFiltroStatus(option.value)
                            }
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
                      {tipoOptions.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`tipo-${option.value}`}
                            checked={filtrosTipo.includes(option.value)}
                            onCheckedChange={() =>
                              toggleFiltroTipo(option.value)
                            }
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
            <Button
              variant="outline"
              className="px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
              onClick={handleTarefaClick}
            >
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>

        {temFiltrosAtivos && (
          <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg border">
            <span className="text-sm font-medium text-muted-foreground">
              Filtros ativos:
            </span>
            {filtrosStatus.map((status) => (
              <Badge
                key={status}
                variant="secondary"
                className="gap-1 pl-2 pr-1"
              >
                {statusOptions.find((s) => s.value === status)?.label || status}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removerFiltro("status", status)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            {filtrosTipo.map((tipo) => (
              <Badge key={tipo} variant="secondary" className="gap-1 pl-2 pr-1">
                {tipo}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removerFiltro("tipo", tipo)}
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

        {atividadesFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {atividadesFiltradas.map((atividade) => (
              <AtividadeCard
                key={atividade.id}
                atividade={atividade}
                onClick={() => handleAtividadeClick(atividade)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700">
                {atividades.length === 0 ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa corresponde aos filtros"}
              </h3>
              <p className="text-gray-500 mt-2">
                {atividades.length === 0 
                  ? "Comece criando uma nova tarefa usando o botão 'Nova Tarefa'"
                  : "Tente ajustar ou limpar os filtros para ver mais resultados"
                }
              </p>
            </div>
            {atividades.length === 0 && (
              <Button 
                onClick={handleTarefaClick}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Tarefa
              </Button>
            )}
          </div>
        )}

        <ModalTarefa
          open={modalTarefaOpen}
          onClose={() => setModalTarefaOpen(false)}
          onSave={handleSaveTarefa}
        />
        <AtividadeModal
          atividade={selectedAtividade}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onUpdate={handleUpdateAtividade}
        />
      </div>
    </main>
  );
}
