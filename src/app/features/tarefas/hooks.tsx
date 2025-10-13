// src/features/clientes/hooks.ts
// Hooks de React para gerenciar o estado de dados de clientes
"use client"

import useSWR from "swr"
import { createTarefa, updateTarefa, deleteTarefa, Tarefa, TarefaInput } from "./api"

// fetcher para SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useTarefas() {
  const { data, error, isLoading, mutate } = useSWR<Tarefa[]>("/api/tarefas", fetcher)

  return {
    tarefas: data,
    isLoading,
    isError: error,
    // Função para revalidar os dados (útil após criar/atualizar/deletar)
    refreshTarefas: mutate,
    // Funções de mutação (opcional, pode chamar diretamente as funções de api.ts)
    create: async (data: TarefaInput) => {
      const newTarefa = await createTarefa(data)
      mutate((prev: Tarefa[] | undefined) => (prev ? [...prev, newTarefa] : [newTarefa]), false)
      return newTarefa
    },
    update: async (id: number, data: Partial<TarefaInput>) => {
      const updatedTarefa = await updateTarefa(id, data)
      mutate((prev: Tarefa[] | undefined) => prev?.map(c => (c.id === id ? updatedTarefa : c)), false) 
      return updatedTarefa
    },
    remove: async (id: number) => {
      await deleteTarefa(id)
      mutate((prev: Tarefa[] | undefined) => prev?.filter(c => c.id !== id), false) 
    },
  }
}

export function useTarefa(id: number) {
  const { data, error, isLoading, mutate } = useSWR<Tarefa>(id ? `/api/tarefas/${id}` : null, fetcher)

  return {
    tarefa: data,
    isLoading,
    isError: error,
    refreshTarefa: mutate,
  }
}