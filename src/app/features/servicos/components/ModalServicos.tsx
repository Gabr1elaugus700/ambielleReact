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

import { TipoServicoInput } from "@/app/features/servicos/api";
import { useEffect, useState } from "react";
import { FormInput } from "@/components/ui/formInput";

type ModalServicosProps = {
  onClose: () => void;
  onSave: (data: TipoServicoInput) => void;
  servico?: TipoServicoInput; // Opcional, caso queira usar para edição futuramente
};

export function ModalServicos({
  onClose,
  onSave,
  servico,
}: ModalServicosProps) {
  const [nome, setNome] = useState(servico?.nome ?? "");
  const [orgao, setOrgao] = useState(servico?.orgao ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setNome(servico?.nome ?? "");
    setOrgao(servico?.orgao ?? "");
  }, [servico]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(false);
    try {
      onSave({
        nome,
        orgao,
      });
      console.log("Erro" + error)
      toast.success("Cadastro de Serviço Realizado!");
    } catch {
      setSaving(false);
      setError(true);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-modal-light dark:bg-modal-dark">
        <DialogHeader>
          <DialogTitle>
            {servico ? "Editar Serviço" : "Cadastro de Serviços"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do Serviço e clique em salvar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="nome"
              label="Nome do Serviço"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <FormInput
              id="orgao"
              label="Orgão Responsável Pelo Serviço"
              value={orgao}
              onChange={(e) => setOrgao(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-sm font-medium rounded border border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-red-400 hover:text-black hover:border-black"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={saving}
              variant={"outline"}
              className="px-2 py-1 text-sm font-medium rounded border border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
