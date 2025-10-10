import { Atividade } from "@/types/atividade";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, DollarSign, FileText, Briefcase, Building2 } from "lucide-react";

interface AtividadeModalProps {
  atividade: Atividade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const corBordas: Record<string, string> = {
  laranja: "border-[4px] border-cardColor-laranja",
  verde: "border-[4px] border-cardColor-verde",
  azul: "border-[4px] border-cardColor-azul",
  amarelo: "border-[4px] border-cardColor-amarelo",
  roxo: "border-[4px] border-cardColor-roxo",
  vermelho: "border-[4px] border-cardColor-vermelho",
};

export function AtividadeModal({ atividade, open, onOpenChange }: AtividadeModalProps) {
  if (!atividade) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-2xl bg-background-light dark:bg-background-dark p-4 cursor-pointer transition-all hover:shadow-md ${
        corBordas[atividade.cor]
      }`}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{atividade.empresa}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p className="text-base">{atividade.tipo}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prazo Final</p>
                <p className="text-base">{new Date(atividade.prazo_final).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor S/N</p>
                <p className="text-base">{atividade.valor_sn}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retenção</p>
                <p className="text-base">{atividade.retencao}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Serviço</p>
                <p className="text-base">{atividade.servico}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
