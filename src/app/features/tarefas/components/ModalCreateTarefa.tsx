"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { TarefaInput, TarefaStatus } from "@/app/features/tarefas/api";
import { useEffect, useState } from "react";
import { ClienteSelect } from "@/components/ui/clienteSelect";
import { Cliente } from "@/app/features/clientes/api";
import { FormInput } from "@/components/ui/formInput";

// Tipo para TipoServico
type TipoServico = {
  id: number;
  nome: string;
  orgao?: string;
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type ModalTarefaProps = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: TarefaInput) => void;
  tarefa?: TarefaInput;
};

export function ModalTarefa({
  open,
  onClose,
  onSave,
  tarefa,
}: ModalTarefaProps) {
  const [tipoServico, setTipoServico] = useState(
    tarefa?.tipo_servico?.toString() ?? ""
  );
  const [dataInicio, setDataInicio] = useState(
    tarefa?.data_inicio?.toString() ?? ""
  );
  const [dataFim, setDataFim] = useState(tarefa?.prazo_final?.toString() ?? "");
  const [observacao, setObservacao] = useState(tarefa?.observacoes ?? "");
  const [valorTotalServico, setValorTotalServico] = useState(
    tarefa?.valor_total_servico?.toString() ?? ""
  );
  const [status, setStatus] = useState(tarefa?.status ?? "");
  const [clienteId, setClienteId] = useState<number>(0);
  const [tiposServico, setTiposServico] = useState<TipoServico[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  const handleClienteChange = (cliente: Cliente | null) => {
    setClienteId(cliente?.id || 0);
  };
  const [saving, setSaving] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Carregar tipos de serviço
  useEffect(() => {
    const loadTiposServico = async () => {
      setLoadingTipos(true);
      try {
        const response = await fetch("/api/tipos-servico");
        if (response.ok) {
          const data = await response.json();
          setTiposServico(data);
        } else {
          toast.error("Erro ao carregar tipos de serviço");
        }
      } catch (error) {
        console.error("Erro ao buscar tipos de serviço:", error);
        toast.error("Erro ao carregar tipos de serviço");
      } finally {
        setLoadingTipos(false);
      }
    };

    loadTiposServico();
  }, []);

  useEffect(() => {
    setTipoServico(tarefa?.tipo_servico?.toString() ?? "");
    setClienteId(tarefa?.cliente_id ?? 0);
    setDataInicio(tarefa?.data_inicio?.toString() ?? "");
    setDataFim(tarefa?.prazo_final?.toString() ?? "");
    setObservacao(tarefa?.observacoes ?? "");
    setValorTotalServico(tarefa?.valor_total_servico?.toString() ?? "");
    setStatus(tarefa?.status ?? "");
  }, [tarefa]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!onSave) return;

    // Validações
    if (clienteId === 0) {
      toast.error("Por favor, selecione um cliente");
      return;
    }

    if (!tipoServico) {
      toast.error("Por favor, selecione um tipo de serviço");
      return;
    }

    if (!dataInicio) {
      toast.error("Por favor, informe a data de início");
      return;
    }

    if (!status) {
      toast.error("Por favor, selecione um status");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      onSave({
        tipo_servico: Number(tipoServico),
        cliente_id: Number(clienteId),
        data_inicio: new Date(dataInicio + 'T00:00:00'),
        prazo_final: dataFim ? new Date(dataFim + 'T00:00:00') : new Date(dataInicio + 'T00:00:00'),
        observacoes: observacao,
        valor_total_servico: valorTotalServico ? Number(valorTotalServico) : 0,
        status: status as TarefaStatus,
      });
      toast.success("Tarefa criada com sucesso!");
      setSaving(false);
      onClose();
      // Resetar formulário
      setTipoServico("");
      setClienteId(0);
      setDataInicio("");
      setDataFim("");
      setObservacao("");
      setValorTotalServico("");
      setStatus("");
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      toast.error("Erro ao salvar tarefa");
      setSaving(false);
    }
  };

  // Modal de cadastro de tarefa
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-modal-light dark:bg-modal-dark">
        <DialogHeader>
          <DialogTitle>
            {tarefa ? "Editar tarefa" : "Cadastro de tarefas"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do tarefa e clique em salvar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {tiposServico.length === 0 && !loadingTipos && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Não há tipos de serviço cadastrados. É
                necessário cadastrar ao menos um tipo de serviço antes de criar
                tarefas.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <ClienteSelect
              value={clienteId}
              onChange={handleClienteChange}
              required
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tipo de Serviço</Label>
              <Select value={tipoServico} onValueChange={setTipoServico}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingTipos
                        ? "Carregando..."
                        : "Selecione o tipo de serviço"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-white dark:bg-gray-800">
                  {tiposServico.length > 0 ? (
                    tiposServico.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nome}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      {loadingTipos
                        ? "Carregando..."
                        : "Nenhum tipo de serviço encontrado"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <FormInput
              label="Data de Início"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              required
            />

            <FormInput
              label="Data de Fim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              required
            />

            <FormInput
              label="Observações"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Digite observações sobre a tarefa..."
            />

            <FormInput
              label="Valor Total do Serviço"
              type="number"
              step="0.01"
              value={valorTotalServico}
              onChange={(e) => setValorTotalServico(e.target.value)}
              required
            />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-white dark:bg-gray-800">
                  <SelectItem value="Iniciado">Iniciado</SelectItem>
                  <SelectItem value="Coleta_De_Informações">
                    Coleta de Informações
                  </SelectItem>
                  <SelectItem value="Execucao">Execução</SelectItem>
                  <SelectItem value="Aprovação_Cliente">
                    Aprovação Cliente
                  </SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Encerrado">Encerrado</SelectItem>
                  <SelectItem value="Protocolado">Protocolado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                className="px-2 py-1 w-28 text-sm font-medium rounded border border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-red-400 hover:text-black hover:border-black"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={saving || loadingTipos || tiposServico.length === 0}
              variant="outline"
              className="px-2 py-1 w-28 text-sm font-medium rounded border border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
