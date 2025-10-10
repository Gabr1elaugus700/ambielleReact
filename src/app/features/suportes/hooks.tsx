// src/features/clientes/hooks.ts
// Hooks de React para gerenciar o estado de dados de clientes
"use client"

import useSWR from "swr"
import { createSuporte, updateSuporte, deleteSuporte, Suporte, SuporteInput } from "./api"

// fetcher para SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useSuportes() {
  const { data, error, isLoading, mutate } = useSWR<Suporte[]>("/api/suporte", fetcher)

  return {
    suportes: data,
    isLoading,
    isError: error,
    // Função para revalidar os dados (útil após criar/atualizar/deletar)
    refreshSuporte: mutate,
    // Funções de mutação (opcional, pode chamar diretamente as funções de api.ts)
    create: async (data: SuporteInput) => {
      const newSuporte = await createSuporte(data)
      mutate((prev: Suporte[] | undefined) => (prev ? [...prev, newSuporte] : [newSuporte]), false) // Otimista
      return newSuporte
    },
    update: async (id: number, data: Partial<SuporteInput>) => {
      const updatedSuporte = await updateSuporte(id, data)
      mutate((prev: Suporte[] | undefined) => prev?.map(c => (c.id === id ? updatedSuporte : c)), false) // Otimista
      return updatedSuporte
    },
    remove: async (id: number) => {
      await deleteSuporte(id)
      mutate((prev: Suporte[] | undefined) => prev?.filter(c => c.id !== id), false) // Otimista
    },
  }
}

export function useSuporte(id: number) {
  const { data, error, isLoading, mutate } = useSWR<Suporte>(id ? `/api/suporte/${id}` : null, fetcher)

  return {
    suporte: data,
    isLoading,
    isError: error,
    refreshSuporte: mutate,
  }
}