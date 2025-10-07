"use client"

import { useEffect, useState } from "react"

type Cliente = {
  id: number
  nome: string
  cnpj: string
  telefone: string
  email: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/clientes")
      if (!res.ok) throw new Error("Falha ao carregar")
      setClientes(await res.json())
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Erro")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          className="border px-2 py-1 rounded"
          placeholder="Buscar por nome ou CNPJ..."
          // implemente busca conforme preferir
        />
        <button className="px-3 py-1 border rounded" onClick={() => setShowCreate(true)}>
          Novo Cliente
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <ul className="space-y-2">
        {clientes.map((c) => (
          <li key={c.id} className="border p-3 rounded flex justify-between">
            <div>
              <div className="font-medium">{c.nome}</div>
              <div className="text-sm text-gray-600">{c.cnpj} • {c.email} • {c.telefone}</div>
            </div>
            <a className="text-blue-600 underline" href={`/clientes/${c.id}`}>Detalhes</a>
          </li>
        ))}
      </ul>

      {showCreate && (
        <CreateClienteModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load() }}
        />
      )}
    </div>
  )
}

function CreateClienteModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    nome: "",
    endereco: "",
    numero: "",
    bairro: "",
    razao_social: "",
    telefone: "",
    email: "",
    contato_principal: "",
    contato_secundario: "",
    proposta_link: "",
    cnpj: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    try {
      setSaving(true)
      setError(null)
      const payload = {
        ...form,
        numero: form.numero ? Number(form.numero) : null,
        bairro: form.bairro || null,
        razao_social: form.razao_social || null,
        contato_secundario: form.contato_secundario || null,
        proposta_link: form.proposta_link || null,
      }
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Falha ao salvar")
      await res.json()
      onCreated()
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Novo Cliente</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border px-2 py-1 rounded" placeholder="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          <input className="border px-2 py-1 rounded" placeholder="CNPJ" value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} />
          <input className="border px-2 py-1 rounded" placeholder="Telefone" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
          <input className="border px-2 py-1 rounded" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <input className="border px-2 py-1 rounded" placeholder="Endereço" value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} />
          <input className="border px-2 py-1 rounded" placeholder="Número" value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} />
          <input className="border px-2 py-1 rounded" placeholder="Bairro" value={form.bairro} onChange={e => setForm(f => ({ ...f, bairro: e.target.value }))} />
          <input className="border px-2 py-1 rounded" placeholder="Razão Social" value={form.razao_social} onChange={e => setForm(f => ({ ...f, razao_social: e.target.value }))} />
          <input className="border px-2 py-1 rounded" placeholder="Contato Principal" value={form.contato_principal} onChange={e => setForm(f => ({ ...f, contato_principal: e.target.value }))} />
          <input className="border px-2 py-1 rounded" placeholder="Contato Secundário" value={form.contato_secundario} onChange={e => setForm(f => ({ ...f, contato_secundario: e.target.value }))} />
          <input className="border px-2 py-1 rounded" placeholder="Link da Proposta" value={form.proposta_link} onChange={e => setForm(f => ({ ...f, proposta_link: e.target.value }))} />
        </div>

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="px-3 py-1 border rounded bg-blue-600 text-white" onClick={submit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}