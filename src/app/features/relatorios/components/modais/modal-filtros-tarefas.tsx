'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TarefasFiltros } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  onExport: (format: "pdf" | "excel", filtros: TarefasFiltros) => Promise<void>;
};

export function ModalFiltrosTarefas({ open, onClose, onExport }: Props) {
  const [filtros, setFiltros] = useState<TarefasFiltros>({
    status: 'todos',
    dataInicial: '',
    dataFinal: '',
    clienteId: '',
  });
  const [formatoSelecionado, setFormatoSelecionado] = useState<"pdf" | "excel">("pdf");

  const resetFiltros = () => {
    setFiltros({
      status: 'todos',
      dataInicial: '',
      dataFinal: '',
      clienteId: '',
    });
    setFormatoSelecionado("pdf");
  };

  const handleExport = async () => {
    await onExport(formatoSelecionado, filtros);
    onClose();
    resetFiltros();
  };

  const handleClose = () => {
    onClose();
    resetFiltros();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Filtros do Relatório de Tarefas</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label>Status</Label>
            <Select
              value={filtros.status}
              onValueChange={(value) => setFiltros({ ...filtros, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Iniciado">Iniciado</SelectItem>
                <SelectItem value="Coleta_de_Informações">Coleta de Informações</SelectItem>
                <SelectItem value="Execucao">Execução</SelectItem>
                <SelectItem value="Aprovação_Cliente">Aprovação Cliente</SelectItem>
                <SelectItem value="Protocolado">Protocolado</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Encerrado">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={filtros.dataInicial}
                onChange={(e) => setFiltros({ ...filtros, dataInicial: e.target.value })}
              />
            </div>
            <div>
              <Label>Data Final</Label>
              <Input
                type="date"
                value={filtros.dataFinal}
                onChange={(e) => setFiltros({ ...filtros, dataFinal: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Formato de Exportação</Label>
            <Select
              value={formatoSelecionado}
              onValueChange={(value: "pdf" | "excel") => setFormatoSelecionado(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleExport}>Exportar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}