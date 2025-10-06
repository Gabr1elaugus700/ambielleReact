'use client'

import { useState } from "react"
import { TaskCard } from "./task-card"
import { TaskDialog } from "./task-dialog"

const columns = [
  { key: 'iniciado',   title: 'Iniciado',   bg: 'bg-status-iniciado',   border: 'border-status-iniciado-border' },
  { key: 'coleta',     title: 'Coleta',     bg: 'bg-status-coleta',     border: 'border-status-coleta-border' },
  { key: 'execucao',   title: 'Execução',   bg: 'bg-status-execucao',   border: 'border-status-execucao-border' },
  { key: 'aprovacao',  title: 'Aprovação',  bg: 'bg-status-aprovacao',  border: 'border-status-aprovacao-border' },
  { key: 'protocolado',title: 'Protocolado',bg: 'bg-status-protocolado',border: 'border-status-protocolado-border' },
] as const

type ModalData = { client: string; task: string; date: string }

export function Kanban() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<ModalData | undefined>()

  const openModal = (d: ModalData) => { setData(d); setOpen(true) }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Próximas do Vencimento</h2>
        <a className="text-sm font-medium text-primary hover:underline" href="#">Ver todas as demandas</a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {columns.map(col => (
          <div key={col.key} className={`${col.bg} border ${col.border} rounded-lg shadow-sm`}>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-900 flex items-center">
                <span className={`w-3 h-3 rounded-full ${col.border} mr-2`} />
                {col.title}
              </h3>
            </div>
            <div className="p-4 pt-0 space-y-3">
              {col.key === 'iniciado' && (
                <>
                  <TaskCard
                    title="ALI CLEAN INDUSTRIA E COMERCIO LTDA"
                    subtitle="Licença Produtos Controlados - 28/03"
                    onClick={() => openModal({ client: 'ALI CLEAN INDUSTRIA E COMERCIO LTDA', task: 'Licença Produtos Controlados', date: '28/03' })}
                  />
                  <TaskCard
                    title="ALI CLEAN INDUSTRIA E COMERCIO LTDA"
                    subtitle="Mapa Exército - 19/10"
                    onClick={() => openModal({ client: 'ALI CLEAN INDUSTRIA E COMERCIO LTDA', task: 'Mapa Exército', date: '19/10' })}
                  />
                </>
              )}
              {col.key === 'aprovacao' && (
                <TaskCard
                  title="ALI CLEAN INDUSTRIA E COMERCIO LTDA"
                  subtitle="Licença Produtos Controlados - 28/09"
                  onClick={() => openModal({ client: 'ALI CLEAN INDUSTRIA E COMERCIO LTDA', task: 'Licença Produtos Controlados', date: '28/09' })}
                />
              )}
              {['coleta','execucao','protocolado'].includes(col.key) && (
                <p className="text-sm text-gray-600 dark:text-gray-700">Nenhuma demanda.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskDialog open={open} onOpenChange={setOpen} data={data} />
    </>
  )
}