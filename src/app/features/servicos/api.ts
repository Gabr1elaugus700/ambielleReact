
export type TipoServicoInput = {
  nome: string
  orgao: string
}

export type TipoServico = TipoServicoInput & { id: number }

const BASE_URL = "/api/servicos" 

export async function getServicos(): Promise<TipoServico[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) {
    const errorData = await res.json()
    console.log(Error)
    throw new Error(errorData.message || "Falha ao buscar tipos de Serviços")
  }
  console.log("Retorno Get: " + res)
  return res.json()
}

export async function getServicoById(id: number): Promise<TipoServico> {
  const res = await fetch(`${BASE_URL}/${id}`)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao buscar Tipo de Serviço ${id}`)
  }
  return res.json()
}

export async function createServico(data: TipoServicoInput): Promise<TipoServico> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || "Falha ao criar Tipo de serviço")
  }
  return res.json()
}

export async function updateServico(id: number, data: Partial<TipoServico>): Promise<TipoServico> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao atualizar Serviço: ${id}`)
  }
  return res.json()
}

export async function deleteServico(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao deletar Serviço: ${id}`)
  }
}