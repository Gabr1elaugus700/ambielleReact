
export type SuporteInput = {
  cliente_id: number
  descricao: string
  valor_hora: number
  data_suporte: Date
  hora_inicio: Date
  hora_fim: Date
  tempo_suporte: number
  valor_total: number
}

export type Suporte = SuporteInput & { 
  id: number;
  cliente?: { 
    id: number;
    nome: string;
  };
}

const BASE_URL = "/api/suporte" 

export async function getSuporte(): Promise<Suporte[]> {
  const res = await fetch(BASE_URL)
  if (!res.ok) {
    const errorData = await res.json()
    console.log(Error)
    throw new Error(errorData.message || "Falha ao buscar Suporte")
  }
  console.log("Retorno Get: " + res)
  return res.json()
}

export async function getSuporteById(id: number): Promise<Suporte> {
  const res = await fetch(`${BASE_URL}/${id}`)
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao buscar Suporte ${id}`)
  }
  return res.json()
}

export async function createSuporte(data: SuporteInput): Promise<Suporte> {
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

export async function updateSuporte(id: number, data: Partial<Suporte>): Promise<Suporte> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao atualizar Suporte: ${id}`)
  }
  return res.json()
}

export async function deleteSuporte(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.message || `Falha ao deletar Suporte: ${id}`)
  }
}