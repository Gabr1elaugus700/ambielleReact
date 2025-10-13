export type TarefaInput = {
  tipo_servico: number
  cliente_id: number
  data_inicio: Date
  prazo_final: Date
  observacoes: string
  valor_total_servico: number
  status: TarefaStatus
}

export type TarefaStatus = "Iniciado" | "Coleta_de_Informações" | "Execucao" | "Aprovação_Cliente" | "Concluído" | "Encerrado" | "Protocolado"

export type Tarefa = TarefaInput & { id: number }

const BASE_URL = "/api/tarefas" 

export async function getTarefas(): Promise<Tarefa[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Falha ao buscar tarefas")
  }
  return res.json()
}

export async function getTarefaById(id: number): Promise<Tarefa> {
  const res = await fetch(`${BASE_URL}/${id}`)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao buscar tarefa ${id}`)
  }
  return res.json()
}

export async function createTarefa(data: TarefaInput): Promise<Tarefa> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Falha ao criar tarefa")
  }
  return res.json()
}

export async function updateTarefa(id: number, data: Partial<TarefaInput>): Promise<Tarefa> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao atualizar tarefa ${id}`)
  }
  return res.json()
}

export async function deleteTarefa(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao deletar tarefa ${id}`)
  }
}