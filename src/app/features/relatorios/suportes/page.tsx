'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FormInput } from "@/components/ui/formInput"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { format } from "date-fns"

type Cliente = {
  id: number
  nome: string
}

export default function RelatorioSuporte() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState({
    dataInicio: format(new Date(), 'yyyy-MM-dd'),
    dataFim: format(new Date(), 'yyyy-MM-dd'),
    clienteId: ''
  })
  const { toast } = useToast()

  // Carregar lista de clientes
  useEffect(() => {
    async function loadClientes() {
      try {
        const response = await fetch('/api/clientes')
        if (!response.ok) throw new Error('Erro ao carregar clientes')
        const data = await response.json()
        setClientes(data)
      } catch (err) {
        console.error(err)
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de clientes",
          variant: "destructive"
        })
      }
    }
    loadClientes()
  }, [toast])

  // Gerar relatório
  async function gerarRelatorio() {
    try {
      setLoading(true)
      
      // Construir URL com os filtros
      const params = new URLSearchParams()
      if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio)
      if (filtros.dataFim) params.append('dataFim', filtros.dataFim)
      if (filtros.clienteId) params.append('clienteId', filtros.clienteId)
      
      // Fazer requisição e abrir PDF
      const response = await fetch(`/api/relatorios/suportes?${params.toString()}`)
      if (!response.ok) throw new Error('Erro ao gerar relatório')
      
      // Converter resposta para blob e criar URL
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Abrir PDF em nova aba
      window.open(url, '_blank')
      
      // Limpar URL do blob
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
      
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Relatório de Suportes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Data Início */}
          <FormInput
            type="date"
            label="Data Início"
            value={filtros.dataInicio}
            onChange={(e) => setFiltros(prev => ({
              ...prev,
              dataInicio: e.target.value
            }))}
          />
          
          {/* Data Fim */}
          <FormInput
            type="date"
            label="Data Fim"
            value={filtros.dataFim}
            onChange={(e) => setFiltros(prev => ({
              ...prev,
              dataFim: e.target.value
            }))}
          />
          
          {/* Cliente */}
          <div className="flex flex-col gap-2">
            <Label>Cliente</Label>
            <Select
              value={filtros.clienteId}
              onValueChange={(value) => setFiltros(prev => ({
                ...prev,
                clienteId: value
              }))}
            >
              <option value="">Todos os clientes</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={String(cliente.id)}>
                  {cliente.nome}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={gerarRelatorio}
            disabled={loading}
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
