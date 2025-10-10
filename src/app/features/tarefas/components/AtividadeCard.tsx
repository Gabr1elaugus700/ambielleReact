import { Atividade } from "@/types/atividade";
import { Card } from "@/components/ui/card";
import { Calendar, DollarSign, FileText, Briefcase } from "lucide-react";

interface AtividadeCardProps {
  atividade: Atividade;
  onClick: () => void;
}

const corBordas: Record<string, string> = {
  laranja: "border-l-[8px] border-l-cardColor-laranja",
  verde: "border-l-[8px] border-l-cardColor-verde",
  azul: "border-l-[8px] border-l-cardColor-azul",
  amarelo: "border-l-[8px] border-l-cardColor-amarelo",
  roxo: "border-l-[8px] border-l-cardColor-roxo",
  vermelho: "border-l-[8px] border-l-cardColor-vermelho",
};

export function AtividadeCard({ atividade, onClick }: AtividadeCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-md bg-card ${
        corBordas[atividade.cor]
      }`}
      onClick={onClick}
    >
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-foreground">{atividade.empresa}</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Prazo Final: </span>
              <span className="text-muted-foreground">
                {new Date(atividade.prazo_final).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Valor S/N: </span>
              <span className="text-muted-foreground">{atividade.valor_sn}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Retenção: </span>
              <span className="text-muted-foreground">{atividade.retencao}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Serviço: </span>
              <span className="text-muted-foreground">{atividade.servico}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
