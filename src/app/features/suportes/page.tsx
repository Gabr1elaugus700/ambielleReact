"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { Suporte, SuporteInput } from "@/app/features/suportes/api";
import { ModalSuportes } from "@/app/features/suportes/components/ModalSuporte"

import { useSuportes } from "@/app/features/suportes/hooks";
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
const columns: Column<Suporte>[] = [
  { 
    key: "cliente", 
    header: "Cliente",
    render: (value, row) => row.cliente?.nome || 'Cliente não encontrado'
  },
  { key: "descricao", header: "Descrição" },
  { 
    key: "valor_hora", 
    header: "Valor Hora",
    render: (value, row) => `R$ ${Number(row.valor_hora).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  },
  { 
    key: "data_suporte", 
    header: "Data do Suporte",
    render: (value, row) => new Date(row.data_suporte).toLocaleDateString('pt-BR')
  },
  { 
    key: "hora_inicio", 
    header: "Hora Início",
    render: (value, row) => new Date(row.hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  },
  { 
    key: "hora_fim", 
    header: "Hora Fim",
    render: (value, row) => row.hora_fim ? new Date(row.hora_fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'
  },
  { 
    key: "tempo_suporte", 
    header: "Tempo Suporte",
    render: (value, row) => row.tempo_suporte ? `${Number(row.tempo_suporte).toFixed(0)} min` : '-'
  },
  { 
    key: "valor_total", 
    header: "Valor Total",
    render: (value, row) => `R$ ${Number(row.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  },
];

export default function ClientesPage() {
  const { suportes, isLoading, isError, create, update, remove } =
    useSuportes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalEditServico, setmodalEditServico] = useState(false);

  const [suporteToEdit, setsuporteToEdit] = useState<Suporte | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [suporteToDelete, setsuporteToDelete] = useState<Suporte | null>(null);

  // Função editar cliente
  async function handleEditServico(row: Suporte) {
    setsuporteToEdit(row);
    setmodalEditServico(true);
  }

  // Excluir cliente
  function handleDeleteClick(row: Suporte) {
    setsuporteToDelete(row);
    setShowDeleteModal(true);
  }

  // Função chamada ao salvar novo servico
  const handleCreateServico = async (data: SuporteInput) => {
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
      setsuporteToDelete(null);
    } catch (error) {
      toast.error("Erro ao excluir cliente." + (error as Error).message);
    }
  }

  // Função chamada ao salvar edição
  const handleUpdateCliente = async (data: SuporteInput) => {
    try {
      if (!suporteToEdit) return;
      await update(suporteToEdit.id, data);
      setmodalEditServico(false);
      setsuporteToEdit(null);
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
    }
  };

  console.log(suportes)
  // Renderização principal da página
  return (
    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 p-4">
        <section className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-4">Suportes</h1>
        {/* Botão para abrir modal de cadastro */}
        <Button 
          onClick={() => setShowCreateModal(true)} 
          className="px-2 py-1 text-sm font-medium rounded border border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
          variant={"outline"}
          >
          <PlusIcon className="mr-2" /> Cadastrar Suporte
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
            data={suportes ?? []}
            tableCaption="Tabela de Serviços"
            onEdit={handleEditServico}
            onDelete={handleDeleteClick}
          />
        )}

        {modalEditServico && suporteToEdit && (
          <ModalEditCliente
            row={suporteToEdit}
            onClose={() => {
              setmodalEditServico(false);
              setsuporteToEdit(null);
            }}
            onSave={handleUpdateCliente}
          />
        )}
        {showCreateModal && (
          <ModalSuportes
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateServico}
          />
        )}

        {showDeleteModal && suporteToDelete && (
          <ModalExcluirCliente
            row={suporteToDelete}
            onClose={() => {
              setShowDeleteModal(false);
              setsuporteToDelete(null);
            }}
            onDelete={confirmDeleteServico}
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
  row: Suporte;
  onClose: () => void;
  onSave: (data: SuporteInput) => void;
}) {
  return <ModalSuportes onClose={onClose} onSave={onSave} suporte={row} />;
}

function ModalExcluirCliente({
  row,
  onClose,
  onDelete,
}: {
  row: Suporte;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="p-6 bg-white rounded shadow-lg">
        <DialogHeader>
          <DialogTitle>Excluir Suporte</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o suporte{" "}
            <span className="font-bold">{row.descricao}</span>?
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
