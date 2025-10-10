"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Building2, FileText, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
type TaskData = {
  client: string;
  task: string;
  date: string;
  status: string;
  description: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data?: TaskData;
};

export function TaskDialog({ open, onOpenChange, data }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-modal-light dark:bg-modal-dark">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes da Tarefa</DialogTitle>
        </DialogHeader>

        {data && (
          <div className="space-y-6 py-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Cliente
                </Label>
                <p className="text-base">{data.client}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Tarefa
                </Label>
                <p className="text-gray-800 dark:text-gray-200 mt-1">
                  {data.task}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Prazo
                </Label>
                <p className="text-gray-800 dark:text-gray-200 mt-1">
                  {data.date}
                  {/* {new Date(data.date).toLocaleDateString('pt-BR')} */}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 ">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  Status
                </Label>
                <Select defaultValue="Iniciado">
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="w-full bg-white">
                    <SelectItem value="Iniciado">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-yellow-400 rounded-full inline-block" />
                        Iniciado
                      </span>
                    </SelectItem>
                    <SelectItem value="Coleta">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-yellow-400 rounded-full inline-block" />
                        Coleta
                      </span>
                    </SelectItem>
                    <SelectItem value="Execução">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-yellow-400 rounded-full inline-block" />
                        Execução
                      </span>
                    </SelectItem>
                    <SelectItem value="Aprovação">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-yellow-400 rounded-full inline-block" />
                        Aprovação
                      </span>
                    </SelectItem>
                    <SelectItem value="Protocolado">Protocolado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="w-full">
                <Label className="text-sm font-medium text-muted-foreground">
                  Descrição
                </Label>
                <Textarea
                  value={data.description}
                  className="mt-1 resize-none w-full border-muted-foreground"
                  // onChange={(e) => setData({ ...data, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            className="px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-red-400 hover:text-black hover:border-black w-24"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          <Button
            variant="outline"
            className="px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
