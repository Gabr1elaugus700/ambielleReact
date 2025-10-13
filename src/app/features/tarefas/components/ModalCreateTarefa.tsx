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

import { TarefaInput } from "@/app/features/tarefas/api";
import { useEffect, useState } from "react";
import { FormInput } from "@/components/ui/formInput";

type ModalCreateTarefaProps = {
  onClose: () => void;
  onSave: (data: TarefaInput) => void;
  tarefa?: TarefaInput;
};

export function ModalTarefa({
  onClose,
  onSave,
  tarefa
}: ModalCreateTarefaProps) {
  const [numero, setNumero] = useState(tarefa?.numero?.toString() ?? "");
  const [bairro, setBairro] = useState(tarefa?.bairro ?? "");
  const [razao_social, setRazaoSocial] = useState(tarefa?.razao_social ?? "");
  const [telefone, setTelefone] = useState(tarefa?.telefone ?? "");
  const [email, setEmail] = useState(tarefa?.email ?? "");
  const [contato_principal, setContatoPrincipal] = useState(tarefa?.contato_principal ?? "");
  const [proposta_link, setPropostaLink] = useState(tarefa?.proposta_link ?? "");
  const [cnpj, setCnpj] = useState(tarefa?.cnpj ?? "");

  const [saving, setSaving] = useState(false);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    setNome(tarefa?.nome ?? "");
    setEndereco(tarefa?.endereco ?? "");
    setNumero(tarefa?.numero?.toString() ?? "");
    setBairro(tarefa?.bairro ?? "");
    setRazaoSocial(tarefa?.razao_social ?? "");
    setTelefone(tarefa?.telefone ?? "");
    setEmail(tarefa?.email ?? "");
    setContatoPrincipal(tarefa?.contato_principal ?? "");
    setPropostaLink(tarefa?.proposta_link ?? "");
    setCnpj(tarefa?.cnpj ?? "");
  }, [tarefa]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    onSave({
      nome,
      endereco,
      numero: numero ? Number(numero) : null,
      bairro,
      razao_social,
      telefone,
      email,
      contato_principal,
      //   contato_secundario,
      proposta_link,
      cnpj,
    });
    toast.success("tarefa criado com sucesso!");
  };

  // Modal de cadastro de tarefa
  return (
    <Dialog open onOpenChange={onClose}>
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
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              id="nome"
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <FormInput
              id="cnpj"
              label="CNPJ"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              required
            />
            <FormInput
              id="telefone"
              label="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
            <FormInput
              id="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormInput
              id="endereco"
              label="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              required
            />
            <FormInput
              id="numero"
              label="Número"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
            />
            <FormInput
              id="bairro"
              label="Bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              required
            />
            <FormInput
              id="razao_social"
              label="Razão Social"
              value={razao_social}
              onChange={(e) => setRazaoSocial(e.target.value)}
              required
            />
            <FormInput
              id="contato_principal"
              label="Contato Principal"
              value={contato_principal}
              onChange={(e) => setContatoPrincipal(e.target.value)}
              required
            />
            <FormInput
              id="proposta_link"
              label="Link da Proposta"
              value={proposta_link}
              onChange={(e) => setPropostaLink(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
