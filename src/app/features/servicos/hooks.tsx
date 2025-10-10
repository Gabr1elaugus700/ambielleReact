// src/features/clientes/hooks.ts
// Hooks de React para gerenciar o estado de dados de clientes
"use client"

import useSWR from "swr"
import { createServico, updateServico, deleteServico, TipoServico, TipoServicoInput } from "./api"

// fetcher para SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useServicos() {
  const { data, error, isLoading, mutate } = useSWR<TipoServico[]>("/api/servicos", fetcher)

  return {
    servicos: data,
    isLoading,
    isError: error,
    // Função para revalidar os dados (útil após criar/atualizar/deletar)
    refreshTarefas: mutate,
    // Funções de mutação (opcional, pode chamar diretamente as funções de api.ts)
    create: async (data: TipoServicoInput) => {
      const newTarefa = await createServico(data)
      mutate((prev: TipoServico[] | undefined) => (prev ? [...prev, newTarefa] : [newTarefa]), false) // Otimista
      return newTarefa
    },
    update: async (id: number, data: Partial<TipoServicoInput>) => {
      const updatedTarefa = await updateServico(id, data)
      mutate((prev: TipoServico[] | undefined) => prev?.map(c => (c.id === id ? updatedTarefa : c)), false) // Otimista
      return updatedTarefa
    },
    remove: async (id: number) => {
      console.log("Removendo serviço com ID:", id);
      await deleteServico(id)
      mutate((prev: TipoServico[] | undefined) => prev?.filter(c => c.id !== id), false) // Otimista
    },
  }
}

export function useServico(id: number) {
  const { data, error, isLoading, mutate } = useSWR<TipoServico>(id ? `/api/servicos/${id}` : null, fetcher)

  return {
    servico: data,
    isLoading,
    isError: error,
    refreshServico: mutate,
  }
}