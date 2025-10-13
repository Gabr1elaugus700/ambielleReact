'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Users, Hourglass, FileSpreadsheet } from "lucide-react"

type Stats = {
  alertas: number;
  clientesAtendidos: number;
  emAndamento: number;
  totalTarefas: number;
}

const palette: Record<string, { wrap: string; icon: string }> = {
  red:    { wrap: "bg-red-100 dark:bg-red-900/50",       icon: "text-red-500 dark:text-red-400" },
  blue:   { wrap: "bg-blue-100 dark:bg-blue-900/50",     icon: "text-blue-500 dark:text-blue-400" },
  green:  { wrap: "bg-green-100 dark:bg-green-900/50",   icon: "text-green-500 dark:text-green-400" },
  yellow: { wrap: "bg-yellow-100 dark:bg-yellow-900/50", icon: "text-yellow-500 dark:text-yellow-400" },
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    alertas: 0,
    clientesAtendidos: 0,
    emAndamento: 0,
    totalTarefas: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        
        // Buscar tarefas
        const tarefasResponse = await fetch('/api/tarefas')
        const tarefas = await tarefasResponse.json()
        
        // Buscar clientes
        const clientesResponse = await fetch('/api/clientes')
        const clientes = await clientesResponse.json()
        
        // Calcular estatísticas
        const hoje = new Date()
        const alertas = tarefas.filter((tarefa: { prazo_final?: string }) => {
          if (!tarefa.prazo_final) return false
          const prazo = new Date(tarefa.prazo_final)
          return prazo < hoje // Tarefas vencidas
        }).length

        const emAndamento = tarefas.filter((tarefa: { status: string }) => 
          ['Iniciado', 'Coleta_de_Informações', 'Execucao', 'Aprovação_Cliente'].includes(tarefa.status)
        ).length

        setStats({
          alertas,
          clientesAtendidos: clientes.length,
          emAndamento,
          totalTarefas: tarefas.length
        })
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const items = [
    { label: "Alertas", value: stats.alertas, icon: <AlertCircle className="h-6 w-6" />, color: "red" },
    { label: "Clientes Atendidos", value: stats.clientesAtendidos, icon: <Users className="h-6 w-6" />, color: "blue" },
    { label: "Total de Tarefas", value: stats.totalTarefas, icon: <FileSpreadsheet className="h-6 w-6" />, color: "green" },
    { label: "Em Atendimento", value: stats.emAndamento, icon: <Hourglass className="h-6 w-6" />, color: "yellow" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {items.map((it) => (
        <Card key={it.label} className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {it.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? (
                <div className="h-8 w-12 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                it.value
              )}
            </div>
            <div className={`${palette[it.color].wrap} p-3 rounded-full`}>
              <span className={palette[it.color].icon}>{it.icon}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}