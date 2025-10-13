'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TaskCard } from "./task-card"
import { TaskDialog } from "./task-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"

const columns = [
  { key: 'iniciado' as const,   title: 'Iniciado',   bg: 'bg-status-iniciado',   border: 'border-status-iniciado-border', status: ['Iniciado'] },
  { key: 'coleta' as const,     title: 'Coleta',     bg: 'bg-status-coleta',     border: 'border-status-coleta-border', status: ['Coleta_de_Informações'] },
  { key: 'execucao' as const,   title: 'Execução',   bg: 'bg-status-execucao',   border: 'border-status-execucao-border', status: ['Execucao'] },
  { key: 'aprovacao' as const,  title: 'Aprovação',  bg: 'bg-status-aprovacao',  border: 'border-status-aprovacao-border', status: ['Aprovação_Cliente'] },
  { key: 'protocolado' as const,title: 'Protocolado',bg: 'bg-status-protocolado',border: 'border-status-protocolado-border', status: ['Protocolado', 'Concluído', 'Encerrado'] },
]

type TarefaKanban = {
  id: string;
  cliente: string;
  tipo_servico: string;
  status: string;
  prazo_final: string;
  data_inicio: string;
}

type TaskDialogData = { 
  client: string; 
  task: string; 
  date: string; 
  startDate?: string;
  endDate?: string;
  status: string; 
  description: string; 
}

export function Kanban() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<TaskDialogData | undefined>()
  const [tarefas, setTarefas] = useState<TarefaKanban[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [diasVencimento, setDiasVencimento] = useState(7) // Padrão 7 dias
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()

  // Buscar tarefas com vencimento próximo
  useEffect(() => {
    const fetchTarefas = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/tarefas')
        if (!response.ok) throw new Error('Erro ao buscar tarefas')
        
        const todasTarefas = await response.json()
        
        // Filtrar apenas tarefas com vencimento próximo
        const hoje = new Date()
        const dataLimite = new Date(hoje)
        dataLimite.setDate(hoje.getDate() + diasVencimento)
        
        const tarefasFiltradas = todasTarefas
          .filter((tarefa: { prazo_final?: string }) => {
            if (!tarefa.prazo_final) return false
            const prazoFinal = new Date(tarefa.prazo_final)
            return prazoFinal >= hoje && prazoFinal <= dataLimite
          })
          .map((tarefa: { 
            id: number; 
            cliente?: { nome: string }; 
            tipoServico?: { nome: string }; 
            status: string; 
            prazo_final: string; 
            data_inicio?: string 
          }) => ({
            id: tarefa.id.toString(),
            cliente: tarefa.cliente?.nome || 'Cliente não informado',
            tipo_servico: tarefa.tipoServico?.nome || 'Tipo não informado',
            status: tarefa.status,
            prazo_final: new Date(tarefa.prazo_final).toLocaleDateString('pt-BR'),
            data_inicio: tarefa.data_inicio ? new Date(tarefa.data_inicio).toLocaleDateString('pt-BR') : ''
          }))
        
        setTarefas(tarefasFiltradas)
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTarefas()
  }, [diasVencimento])

  const openModal = (tarefa: TarefaKanban) => {
    const modalData: TaskDialogData = {
      client: tarefa.cliente,
      task: tarefa.tipo_servico,
      date: tarefa.prazo_final,
      startDate: tarefa.data_inicio,
      endDate: tarefa.prazo_final,
      status: tarefa.status,
      description: `Tarefa: ${tarefa.tipo_servico} para ${tarefa.cliente}`
    }
    setData(modalData)
    setOpen(true)
  }

  const handleVerTodas = () => {
    router.push('/features/tarefas')
  }

  // Agrupar tarefas por status
  const tarefasPorStatus = columns.reduce((acc, col) => {
    acc[col.key] = tarefas.filter(tarefa => col.status.includes(tarefa.status))
    return acc
  }, {} as Record<string, TarefaKanban[]>)

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Próximas do Vencimento</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tarefas que vencem nos próximos {diasVencimento} dias
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1"
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs">Configurar</span>
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleVerTodas}
            className="text-sm font-medium"
          >
            Ver todas as atividades
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6 border">
          <div className="flex items-center gap-4">
            <Label htmlFor="dias-vencimento" className="text-sm font-medium">
              Mostrar tarefas que vencem nos próximos:
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="dias-vencimento"
                type="number"
                min="1"
                max="30"
                value={diasVencimento === 0 ? '' : diasVencimento}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || isNaN(Number(val))) {
                    setDiasVencimento(0);
                  } else {
                    setDiasVencimento(Number(val));
                  }
                }}
                className="w-20 h-8"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">dias</span>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {columns.map(col => (
            <div key={col.key} className={`${col.bg} border ${col.border} rounded-lg shadow-sm animate-pulse`}>
              <div className="p-4">
                <div className="h-6 bg-gray-300 rounded"></div>
              </div>
              <div className="p-4 pt-0 space-y-3">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {columns.map(col => {
            const tarefasColuna = tarefasPorStatus[col.key] || []
            return (
              <div key={col.key} className={`${col.bg} border ${col.border} rounded-lg shadow-sm`}>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-900 flex items-center">
                    <span className={`w-3 h-3 rounded-full ${col.border} mr-2`} />
                    {col.title}
                    <span className="ml-2 text-xs bg-white/50 px-2 py-1 rounded-full">
                      {tarefasColuna.length}
                    </span>
                  </h3>
                </div>
                <div className="p-4 pt-0 space-y-3">
                  {tarefasColuna.length > 0 ? (
                    tarefasColuna.map(tarefa => (
                      <TaskCard
                        key={tarefa.id}
                        title={tarefa.cliente}
                        subtitle={`${tarefa.tipo_servico} - ${tarefa.prazo_final}`}
                        onClick={() => openModal(tarefa)}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-700">Nenhuma tarefa próxima do vencimento.</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <TaskDialog open={open} onOpenChange={setOpen} data={data} />
    </>
  )
}