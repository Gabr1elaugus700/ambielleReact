// src/features/clientes/api.ts
// Funções que o frontend usa para interagir com as API Routes

export type ClienteInput = {
  nome: string
  endereco: string
  numero?: number | null
  bairro?: string | null
  razao_social?: string | null
  telefone: string
  email: string
  contato_principal: string
  contato_secundario?: string | null
  proposta_link?: string | null
  cnpj: string
  data_cadastro?: string 
}

export type Cliente = ClienteInput & { id: number }

const BASE_URL = "/api/clientes" // Prefira usar caminhos relativos para APIs internas

export async function getClientes(): Promise<Cliente[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Falha ao buscar clientes")
  }
  return res.json()
}

export async function getClienteById(id: number): Promise<Cliente> {
  const res = await fetch(`${BASE_URL}/${id}`)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao buscar cliente ${id}`)
  }
  return res.json()
}

export async function createCliente(data: ClienteInput): Promise<Cliente> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Falha ao criar cliente")
  }
  return res.json()
}

export async function updateCliente(id: number, data: Partial<ClienteInput>): Promise<Cliente> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao atualizar cliente ${id}`)
  }
  return res.json()
}

export async function deleteCliente(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao deletar cliente ${id}`)
  }
}