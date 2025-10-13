import { Atividade } from "@/types/atividade";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, FileText, Activity } from "lucide-react";

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

// Função para mapear status para cores do badge
const getStatusBadgeClass = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('iniciado')) return "bg-blue-100 text-blue-800 border-blue-200";
  if (statusLower.includes('coleta')) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (statusLower.includes('execu')) return "bg-orange-100 text-orange-800 border-orange-200";
  if (statusLower.includes('aprovação')) return "bg-purple-100 text-purple-800 border-purple-200";
  if (statusLower.includes('concluído')) return "bg-green-100 text-green-800 border-green-200";
  if (statusLower.includes('protocolado')) return "bg-green-100 text-green-800 border-green-200";
  if (statusLower.includes('encerrado')) return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

// Função para formatar o texto do status
const formatarStatusTexto = (status: string) => {
  switch (status) {
    case "Coleta_de_Informações":
      return "Coleta de Informações";
    case "Execucao":
      return "Execução";
    case "Aprovação_Cliente":
      return "Aprovação Cliente";
    default:
      return status;
  }
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
              <span className="font-medium text-foreground">Data Inicial: </span>
              <span className="text-muted-foreground">
                {atividade.data_inicio || "Não informado"}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-orange-600">Prazo Término: </span>
              <span className="text-muted-foreground font-semibold bg-orange-50 px-1 rounded">
                {atividade.prazo_final}
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
              <span className="font-medium text-foreground">Observação: </span>
              <span className="text-muted-foreground">{atividade.observacao}</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Activity className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Status: </span>
              <Badge 
                className={`text-xs px-2 py-1 ${getStatusBadgeClass(atividade.servico)}`}
              >
                {formatarStatusTexto(atividade.servico)}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
