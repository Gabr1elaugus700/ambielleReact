'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TaskData = { client: string; task: string; date: string }

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  data?: TaskData
}

export function TaskDialog({ open, onOpenChange, data }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes da Tarefa</DialogTitle>
        </DialogHeader>

        {data && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Cliente</Label>
              <p className="text-gray-800 dark:text-gray-200 mt-1">{data.client}</p>
            </div>
            <div>
              <Label className="text-sm">Tarefa</Label>
              <p className="text-gray-800 dark:text-gray-200 mt-1">{data.task}</p>
            </div>
            <div>
              <Label className="text-sm">Data</Label>
              <p className="text-gray-800 dark:text-gray-200 mt-1">{data.date}</p>
            </div>
            <div>
              <Label className="text-sm">Status</Label>
              <Select defaultValue="Iniciado">
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iniciado">Iniciado</SelectItem>
                  <SelectItem value="Coleta">Coleta</SelectItem>
                  <SelectItem value="Execução">Execução</SelectItem>
                  <SelectItem value="Aprovação">Aprovação</SelectItem>
                  <SelectItem value="Protocolado">Protocolado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button>Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}