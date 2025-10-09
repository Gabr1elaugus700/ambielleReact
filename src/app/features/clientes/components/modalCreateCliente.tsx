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

import { ClienteInput } from "@/app/features/clientes/api";
import { useEffect, useState } from "react";
import { FormInput } from "@/components/ui/formInput";

type ModalCreateClienteProps = {
  onClose: () => void;
  onSave: (data: ClienteInput) => void;
  cliente?: ClienteInput; // Opcional, caso queira usar para edição futuramente
};

export function ModalCliente({
  onClose,
  onSave,
  cliente
}: ModalCreateClienteProps) {
  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [endereco, setEndereco] = useState(cliente?.endereco ?? "");
  const [numero, setNumero] = useState(cliente?.numero?.toString() ?? "");
  const [bairro, setBairro] = useState(cliente?.bairro ?? "");
  const [razao_social, setRazaoSocial] = useState(cliente?.razao_social ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [contato_principal, setContatoPrincipal] = useState(cliente?.contato_principal ?? "");
  const [proposta_link, setPropostaLink] = useState(cliente?.proposta_link ?? "");
  const [cnpj, setCnpj] = useState(cliente?.cnpj ?? "");

  const [saving, setSaving] = useState(false);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    setNome(cliente?.nome ?? "");
    setEndereco(cliente?.endereco ?? "");
    setNumero(cliente?.numero?.toString() ?? "");
    setBairro(cliente?.bairro ?? "");
    setRazaoSocial(cliente?.razao_social ?? "");
    setTelefone(cliente?.telefone ?? "");
    setEmail(cliente?.email ?? "");
    setContatoPrincipal(cliente?.contato_principal ?? "");
    setPropostaLink(cliente?.proposta_link ?? "");
    setCnpj(cliente?.cnpj ?? "");
  }, [cliente]);

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
    toast.success("Cliente criado com sucesso!");
  };

  // Modal de cadastro de cliente
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-modal-light dark:bg-modal-dark">
        <DialogHeader>
          <DialogTitle>
            {cliente ? "Editar Cliente" : "Cadastro de Clientes"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente e clique em salvar.
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
