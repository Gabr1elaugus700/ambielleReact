// src/features/clientes/hooks.ts
// Hooks de React para gerenciar o estado de dados de clientes
"use client"

import useSWR from "swr"
import { createCliente, updateCliente, deleteCliente, Cliente, ClienteInput } from "./api"

// fetcher para SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useClientes() {
  const { data, error, isLoading, mutate } = useSWR<Cliente[]>("/api/clientes", fetcher)

  return {
    clientes: data,
    isLoading,
    isError: error,
    // Função para revalidar os dados (útil após criar/atualizar/deletar)
    refreshClientes: mutate,
    // Funções de mutação (opcional, pode chamar diretamente as funções de api.ts)
    create: async (data: ClienteInput) => {
      const newCliente = await createCliente(data)
      mutate((prev: Cliente[] | undefined) => (prev ? [...prev, newCliente] : [newCliente]), false) // Otimista
      return newCliente
    },
    update: async (id: number, data: Partial<ClienteInput>) => {
      const updatedCliente = await updateCliente(id, data)
      mutate((prev: Cliente[] | undefined) => prev?.map(c => (c.id === id ? updatedCliente : c)), false) // Otimista
      return updatedCliente
    },
    remove: async (id: number) => {
      await deleteCliente(id)
      mutate((prev: Cliente[] | undefined) => prev?.filter(c => c.id !== id), false) // Otimista
    },
  }
}

export function useCliente(id: number) {
  const { data, error, isLoading, mutate } = useSWR<Cliente>(id ? `/api/clientes/${id}` : null, fetcher)

  return {
    cliente: data,
    isLoading,
    isError: error,
    refreshCliente: mutate,
  }
}