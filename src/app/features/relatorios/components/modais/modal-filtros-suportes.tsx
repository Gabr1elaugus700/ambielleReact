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
  onExport: (format: "pdf" | "excel", filtros: SuporteFiltros) => Promise<void>;
};

type SuporteFiltros = {
  dataInicial?: string;
  dataFinal?: string;
  clienteId?: string;
};

export function ModalFiltrosSuportes({ open, onClose, onExport }: Props) {
  const [filtros, setFiltros] = useState<SuporteFiltros>({});
  const [formatoSelecionado, setFormatoSelecionado] = useState<"pdf" | "excel">("pdf");

  const handleExport = async () => {
    await onExport(formatoSelecionado, filtros);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Filtros do Relatório de Suportes</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleExport}>Exportar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}