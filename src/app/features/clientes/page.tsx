"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { Cliente, ClienteInput } from "@/app/features/clientes/api";

import { useClientes } from "@/app/features/clientes/hooks";
import { ModalCliente } from "./components/modalCreateCliente";
import { DataTable } from "@/components/ui/dataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Definição das colunas da tabela de clientes
const columns = [
  { key: "nome", label: "Nome" },
  { key: "razao_social", label: "Razão Social" },
  { key: "cnpj", label: "CNPJ" },
  { key: "telefone", label: "Telefone" },
  { key: "email", label: "Email" },
  { key: "endereco", label: "Endereço" },
  { key: "contato_principal", label: "Contato Principal" },
];

export default function ClientesPage() {
  const { clientes, isLoading, isError, create, update, remove } =
    useClientes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalEditCliente, setModalEditCliente] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  // Função editar cliente
  async function handleEditCliente(row: Cliente) {
    setClienteToEdit(row);
    setModalEditCliente(true);
  }

  // Excluir cliente
  function handleDeleteClick(row: Cliente) {
    setClienteToDelete(row);
    setShowDeleteModal(true);
  }
  // Função chamada ao salvar novo cliente
  const handleCreateCliente = async (data: ClienteInput) => {
    try {
      await create(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    }
  };

  async function confirmDeleteCliente(id: number) {
    try {
      await remove(id);
      toast.success("Cliente excluído com sucesso!");
      setShowDeleteModal(false);
      setClienteToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir cliente." + (error as Error).message);
    }
  }

  // Função chamada ao salvar edição
  const handleUpdateCliente = async (data: ClienteInput) => {
    try {
      if (!clienteToEdit) return;
      await update(clienteToEdit.id, data);
      setModalEditCliente(false);
      setClienteToEdit(null);
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
    }
  };

  // Renderização principal da página
  return (
    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 p-4">
        <section className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-4">Clientes</h1>
        {/* Botão para abrir modal de cadastro */}
        <Button 
          onClick={() => setShowCreateModal(true)} 
          className="px-2 py-1 text-sm font-medium rounded border border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
          variant={"outline"}
          >
          <PlusIcon className="mr-2" /> Novo Cliente
        </Button>
        </section>

        {/* Tabela de clientes */}
        {isLoading ? (
          <p>Carregando clientes...</p>
        ) : isError ? (
          <p>Erro ao carregar clientes.</p>
        ) : (
          <DataTable
            columns={columns}
            data={clientes ?? []}
            tableCaption="Tabela de Clientes"
            onEdit={handleEditCliente}
            onDelete={handleDeleteClick}
          />
        )}

        {modalEditCliente && clienteToEdit && (
          <ModalEditCliente
            row={clienteToEdit}
            onClose={() => {
              setModalEditCliente(false);
              setClienteToEdit(null);
            }}
            onSave={handleUpdateCliente}
          />
        )}
        {showCreateModal && (
          <ModalCliente
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateCliente}
          />
        )}

        {showDeleteModal && clienteToDelete && (
          <ModalExcluirCliente
            row={clienteToDelete}
            onClose={() => {
              setShowDeleteModal(false);
              setClienteToDelete(null);
            }}
            onDelete={confirmDeleteCliente}
          />
        )}
      </div>
    </main>
  );
}

// ModalEditCliente agora recebe onSave
function ModalEditCliente({
  row,
  onClose,
  onSave,
}: {
  row: Cliente;
  onClose: () => void;
  onSave: (data: ClienteInput) => void;
}) {
  return <ModalCliente onClose={onClose} onSave={onSave} cliente={row} />;
}

function ModalExcluirCliente({
  row,
  onClose,
  onDelete,
}: {
  row: Cliente;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="p-6 bg-white rounded shadow-lg">
        <DialogHeader>
          <DialogTitle>Excluir Cliente</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o cliente{" "}
            <span className="font-bold">{row.nome}</span>?
          </DialogDescription>
        </DialogHeader>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={() => onDelete(row.id)}>Excluir</Button>
      </DialogContent>
    </Dialog>
  );
}
