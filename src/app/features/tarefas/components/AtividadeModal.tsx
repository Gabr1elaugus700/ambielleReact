import { Atividade } from "@/types/atividade";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, DollarSign, FileText, Briefcase, Building2, Pencil  , Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface AtividadeModalProps {
  atividade: Atividade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (id: string, data: Partial<Atividade>) => Promise<void>;
}

const corBordas: Record<string, string> = {
  laranja: "border-[4px] border-cardColor-laranja",
  verde: "border-[4px] border-cardColor-verde",
  azul: "border-[4px] border-cardColor-azul",
  amarelo: "border-[4px] border-cardColor-amarelo",
  roxo: "border-[4px] border-cardColor-roxo",
  vermelho: "border-[4px] border-cardColor-vermelho",
};

export function AtividadeModal({ atividade, open, onOpenChange, onUpdate }: AtividadeModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Atividade | null>(null);

  // Inicializar formData quando atividade mudar
  useEffect(() => {
    if (atividade) {
      setFormData({ ...atividade });
    }
  }, [atividade]);

  if (!atividade || !formData) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...atividade });
  };

  const handleSave = async () => {
    if (!onUpdate) {
      toast.error("Função de atualização não disponível");
      return;
    }

    try {
      setIsSaving(true);
      await onUpdate(atividade.id, formData);
      setIsEditing(false);
      toast.success("Atividade atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      toast.error("Erro ao atualizar atividade");
    } finally {
      setIsSaving(false);
    }
  };

  const statusOptions = [
    { value: "Iniciado", label: "Iniciado" },
    { value: "Coleta_de_Informações", label: "Coleta de Informações" },
    { value: "Execucao", label: "Execução" },
    { value: "Aprovação_Cliente", label: "Aprovação Cliente" },
    { value: "Concluído", label: "Concluído" },
    { value: "Protocolado", label: "Protocolado" },
    { value: "Encerrado", label: "Encerrado" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl bg-background-light dark:bg-background-dark p-4 cursor-pointer transition-all hover:shadow-md ${
        corBordas[atividade.cor]
      }`}>
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{atividade.empresa}</DialogTitle>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="mt-1 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-1 px-2 text-xs"
                >
                  <Pencil  className="h-3 w-3" />
                  Atualizar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                {isEditing ? (
                  <Input
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base">{atividade.tipo}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Data Inicial</p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.data_inicio?.split('/').reverse().join('-') || ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value).toLocaleDateString('pt-BR') : "";
                      setFormData({ ...formData, data_inicio: date });
                    }}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base">{atividade.data_inicio || "Não informado"}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  Prazo Término
                </p>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.prazo_final?.split('/').reverse().join('-') || ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value).toLocaleDateString('pt-BR') : "";
                      setFormData({ ...formData, prazo_final: date });
                    }}
                    className="mt-1"
                  />
                ) : (
                  <div className="mt-1 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 px-3 py-2 rounded-lg border-l-4 border-orange-500 shadow-sm">
                    <p className="text-gray-800 dark:text-gray-200 font-semibold text-base">
                      {atividade.prazo_final}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Valor S/N</p>
                {isEditing ? (
                  <Input
                    value={formData.valor_sn}
                    onChange={(e) => setFormData({ ...formData, valor_sn: e.target.value })}
                    className="mt-1"
                    placeholder="R$ 0,00"
                  />
                ) : (
                  <p className="text-base">{atividade.valor_sn}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Observação</p>
                {isEditing ? (
                  <Textarea
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    className="mt-1"
                    rows={3}
                    placeholder="Digite suas observações..."
                  />
                ) : (
                  <p className="text-base">{atividade.observacao}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                {isEditing ? (
                  <Select
                    value={formData.servico}
                    onValueChange={(value) => setFormData({ ...formData, servico: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-base">{atividade.servico}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <DialogFooter className="pt-6 mt-4 border-t border-border">
            <div className="flex gap-3 w-full justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="px-2 py-1 text-xs rounded min-w-40 border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-red-400 hover:text-black hover:border-black"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
                className="px-2 py-1 text-xs rounded min-w-40 border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
