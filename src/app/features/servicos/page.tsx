"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { TipoServico, TipoServicoInput } from "@/app/features/servicos/api";
import { ModalServicos } from "@/app/features/servicos/components/ModalServicos"

import { useServicos } from "@/app/features/servicos/hooks";
import { DataTable } from "@/components/ui/dataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Column } from "@/types/types"

// Definição das colunas da tabela de clientes
const columns: Column<TipoServico>[] = [
  { key: "nome", header: "Nome" },
  { key: "orgao", header: "Orgão Competente" },
];

export default function ClientesPage() {
  const { servicos, isLoading, isError, create, update, remove } =
    useServicos();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalEditServico, setmodalEditServico] = useState(false);

  const [servicoToEdit, setservicoToEdit] = useState<TipoServico | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<TipoServico | null>(null);

  // Função editar cliente
  async function handleEditServico(row: TipoServico) {
    setservicoToEdit(row);
    setmodalEditServico(true);
  }

  // Excluir cliente
  function handleDeleteClick(row: TipoServico) {
    setClienteToDelete(row);
    setShowDeleteModal(true);
  }

  // Função chamada ao salvar novo servico
  const handleCreateServico = async (data: TipoServicoInput) => {
    try {
      await create(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
    }
  };

  async function confirmDeleteServico(id: number) {
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
  const handleUpdateCliente = async (data: TipoServicoInput) => {
    try {
      if (!servicoToEdit) return;
      await update(servicoToEdit.id, data);
      setmodalEditServico(false);
      setservicoToEdit(null);
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
    }
  };
  // Renderização principal da página
  return (
    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 p-4">
        <section className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-4">Serviços</h1>
        {/* Botão para abrir modal de cadastro */}
        <Button 
          onClick={() => setShowCreateModal(true)} 
          className="px-2 py-1 text-sm font-medium rounded border border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
          variant={"outline"}
          >
          <PlusIcon className="mr-2" /> Cadastrar Serviços
        </Button>
        </section>

        {/* Tabela de clientes */}
        {isLoading ? (
          <p>Carregando Serviços...</p>
        ) : isError ? (
          <p>Erro ao carregar Serviços.</p>
        ) : (
          <DataTable
            columns={columns}
            data={servicos ?? []}
            tableCaption="Tabela de Serviços"
            onEdit={handleEditServico}
            onDelete={handleDeleteClick}
          />
        )}

        {modalEditServico && servicoToEdit && (
          <ModalEditServico
            row={servicoToEdit}
            onClose={() => {
              setmodalEditServico(false);
              setservicoToEdit(null);
            }}
            onSave={handleUpdateCliente}
          />
        )}
        {showCreateModal && (
          <ModalServicos
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateServico}
          />
        )}

        {showDeleteModal && clienteToDelete && (
          <ModalExcluirCliente
            row={clienteToDelete}
            onClose={() => {
              setShowDeleteModal(false);
              setClienteToDelete(null);
            }}
            onDelete={confirmDeleteServico}
          />
        )}
      </div>
    </main>
  );
}

// modalEditServico agora recebe onSave
function ModalEditServico({
  row,
  onClose,
  onSave,
}: {
  row: TipoServico;
  onClose: () => void;
  onSave: (data: TipoServicoInput) => void;
}) {
  return <ModalServicos onClose={onClose} onSave={onSave} servico={row} />;
}

function ModalExcluirCliente({
  row,
  onClose,
  onDelete,
}: {
  row: TipoServico;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="p-6 bg-white rounded shadow-lg">
        <DialogHeader>
          <DialogTitle>Excluir Cliente</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o Serviço:{" "}
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
