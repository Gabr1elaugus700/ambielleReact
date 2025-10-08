"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { ClienteInput } from "@/app/features/clientes/api";

import { useClientes } from "@/app/features/clientes/hooks";
import { on } from "events";

export default function ClientesPage() {
  // Hook customizado para buscar clientes e manipular dados
  const { clientes, isLoading, isError, create } = useClientes();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Função chamada ao salvar novo cliente
  const handleCreateCliente = async (data: ClienteInput) => {
    try {
      await create(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    }
  };

  // Renderização principal da página
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      {/* Botão para abrir modal de cadastro */}
      <Button onClick={() => setShowCreateModal(true)}>
        <PlusIcon className="mr-2" /> Novo Cliente
      </Button>

      {/* Tabela de clientes */}
      {isLoading ? (
        <p>Carregando clientes...</p>
      ) : isError ? (
        <p>Erro ao carregar clientes.</p>
      ) : (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Nome</th>
              <th className="border px-2 py-1">CNPJ</th>
              <th className="border px-2 py-1">Telefone</th>
              <th className="border px-2 py-1">Email</th>
            </tr>
          </thead>
          <tbody>
            {clientes?.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{cliente.nome}</td>
                <td className="border px-2 py-1">{cliente.cnpj}</td>
                <td className="border px-2 py-1">{cliente.telefone}</td>
                <td className="border px-2 py-1">{cliente.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de cadastro de cliente */}
      {showCreateModal && (
        <CreateClienteModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCliente}
        />
      )}
    </div>
  );
}

function CreateClienteModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: ClienteInput) => void;
}) {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [razao_social, setRazaoSocial] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [contato_principal, setContatoPrincipal] = useState("");
  const [contato_secundario, setContatoSecundario] = useState("");
  const [proposta_link, setPropostaLink] = useState("");
  const [cnpj, setCnpj] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nome,
      endereco,
      numero: numero ? Number(numero) : null,
      bairro,
      razao_social,
      telefone,
      email,
      contato_principal,
      contato_secundario,
      proposta_link,
      cnpj,
    });
  };

  // Modal de cadastro de cliente
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cadastro de Clientes</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente e clique em salvar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="border px-2 py-1 rounded"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
              <input
                className="border px-2 py-1 rounded"
                placeholder="CNPJ"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                required
              />
              <input
                className="border px-2 py-1 rounded"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />
              <input
                className="border px-2 py-1 rounded"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="border px-2 py-1 rounded"
                placeholder="Endereço"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
              <input
                className="border px-2 py-1 rounded"
                placeholder="Número"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
              <input
                className="border px-2 py-1 rounded"
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
              <input
                className="border px-2 py-1 rounded"
                placeholder="Razão Social"
                value={razao_social}
                onChange={(e) => setRazaoSocial(e.target.value)}
              />
              <input
                className="border px-2 py-1 rounded"
                placeholder="Contato Principal"
                value={contato_principal}
                onChange={(e) => setContatoPrincipal(e.target.value)}
              />
              <input
                className="border px-2 py-1 rounded"
                placeholder="Contato Secundário"
                value={contato_secundario}
                onChange={(e) => setContatoSecundario(e.target.value)}
              />
              <input
                className="border px-2 py-1 rounded"
                placeholder="Link da Proposta"
                value={proposta_link}
                onChange={(e) => setPropostaLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
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
