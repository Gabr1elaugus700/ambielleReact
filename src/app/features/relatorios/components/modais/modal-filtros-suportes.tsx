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
  formato: "pdf" | "excel";
  onClose: () => void;
  onExport: (filtros: SuporteFiltros) => Promise<void>;
};

type SuporteFiltros = {
  dataInicial?: string;
  dataFinal?: string;
  clienteId?: string;
};

export function ModalFiltrosSuportes({ open, formato, onClose, onExport }: Props) {
  const [filtros, setFiltros] = useState<SuporteFiltros>({});

  const handleExport = async () => {
    await onExport(filtros);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Filtros do Relatório de Suportes ({formato.toUpperCase()})</DialogTitle>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleExport}>Exportar {formato.toUpperCase()}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}