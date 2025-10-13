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

// Função para formatar CNPJ
const formatarCNPJ = (value: string) => {
  // Remove todos os caracteres não numéricos
  const numeros = value.replace(/\D/g, "");
  
  // Aplica a máscara XX.XXX.XXX/XXXX-XX
  return numeros
    .slice(0, 14) // Limita a 14 dígitos
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

// Função para remover formatação do CNPJ (para salvar apenas números)
const removerFormatacaoCNPJ = (value: string) => {
  return value.replace(/\D/g, "");
};

// Função para formatar Telefone
const formatarTelefone = (value: string) => {
  // Remove todos os caracteres não numéricos
  const numeros = value.replace(/\D/g, "");
  
  // Aplica a máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (numeros.length <= 10) {
    return numeros
      .slice(0, 10)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    return numeros
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
};

// Função para remover formatação do Telefone (para salvar apenas números)
const removerFormatacaoTelefone = (value: string) => {
  return value.replace(/\D/g, "");
};

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
  const [cnpjFormatado, setCnpjFormatado] = useState(
    cliente?.cnpj ? formatarCNPJ(cliente.cnpj) : ""
  );
  const [telefoneFormatado, setTelefoneFormatado] = useState(
    cliente?.telefone ? formatarTelefone(cliente.telefone) : ""
  );

  const [saving, setSaving] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Função para lidar com a mudança do CNPJ
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const valorFormatado = formatarCNPJ(valor);
    const valorLimpo = removerFormatacaoCNPJ(valor);
    
    setCnpjFormatado(valorFormatado);
    setCnpj(valorLimpo);
  };

  // Função para lidar com a mudança do Telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const valorFormatado = formatarTelefone(valor);
    const valorLimpo = removerFormatacaoTelefone(valor);
    
    setTelefoneFormatado(valorFormatado);
    setTelefone(valorLimpo);
  };

  useEffect(() => {
    setNome(cliente?.nome ?? "");
    setEndereco(cliente?.endereco ?? "");
    setNumero(cliente?.numero?.toString() ?? "");
    setBairro(cliente?.bairro ?? "");
    setRazaoSocial(cliente?.razao_social ?? "");
    setTelefone(cliente?.telefone ?? "");
    setTelefoneFormatado(cliente?.telefone ? formatarTelefone(cliente.telefone) : "");
    setEmail(cliente?.email ?? "");
    setContatoPrincipal(cliente?.contato_principal ?? "");
    setPropostaLink(cliente?.proposta_link ?? "");
    setCnpj(cliente?.cnpj ?? "");
    setCnpjFormatado(cliente?.cnpj ? formatarCNPJ(cliente.cnpj) : "");
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
              value={cnpjFormatado}
              onChange={handleCnpjChange}
              placeholder="XX.XXX.XXX/XXXX-XX"
              required
            />
            <FormInput
              id="telefone"
              label="Telefone"
              value={telefoneFormatado}
              onChange={handleTelefoneChange}
              placeholder="(XX) XXXXX-XXXX"
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
