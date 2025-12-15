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

type Props = {
  open: boolean;
  onClose: () => void;
  onExport: (format: "pdf" | "excel", filtros: FinanceiroFiltros) => Promise<void>;
};

type FinanceiroFiltros = {
  dataInicio?: string;
  dataFim?: string;
  tipo?: "todos" | "tarefas" | "suportes";
};

export function ModalFiltrosFinanceiro({ open, onClose, onExport }: Props) {
  const [filtros, setFiltros] = useState<FinanceiroFiltros>({
    tipo: "todos"
  });
  const [formatoSelecionado, setFormatoSelecionado] = useState<"pdf" | "excel">("pdf");

  const handleExport = async () => {
    await onExport(formatoSelecionado, filtros);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Filtros do Relatório Financeiro</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label>Tipo de Relatório</Label>
            <Select
              value={filtros.tipo}
              onValueChange={(value: "todos" | "tarefas" | "suportes") => 
                setFiltros({ ...filtros, tipo: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="todos">Tarefas e Suportes</SelectItem>
                <SelectItem value="tarefas">Somente Tarefas</SelectItem>
                <SelectItem value="suportes">Somente Suportes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
            <div>
              <Label>Data Final</Label>
              <Input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
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
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleExport}>Exportar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}