"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Users,
  Headphones,
  ClipboardList,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ReportType = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
};

const reports: ReportType[] = [
  {
    id: "financeiro",
    title: "Relatório Financeiro",
    description: "Receitas, despesas e balanço geral do período",
    icon: DollarSign,
    color: "text-status-execucao",
  },
  {
    id: "clientes",
    title: "Relatório de Clientes",
    description: "Lista completa de clientes e informações cadastrais",
    icon: Users,
    color: "text-status-coleta",
  },
  {
    id: "suporte",
    title: "Relatório de Suporte",
    description: "Chamados, status e tempo de resolução",
    icon: Headphones,
    color: "text-status-aprovacao",
  },
  {
    id: "tarefas",
    title: "Relatório de Tarefas por Status",
    description: "Distribuição e progresso das tarefas",
    icon: ClipboardList,
    color: "text-status-iniciado",
  },
  {
    id: "atividades",
    title: "Relatório de Atividades",
    description: "Atividades realizadas e prazos cumpridos",
    icon: FileText,
    color: "text-status-protocolado",
  },
];

export default function Relatorios() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (reportId: string, format: "pdf" | "excel") => {
    setLoading(`${reportId}-${format}`);

    // Simular exportação
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Relatório exportado com sucesso!",
      description: `O relatório foi exportado em formato ${format.toUpperCase()}.`,
    });

    setLoading(null);
  };

  return (
    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Relatórios
          </h1>
          <p className="text-muted-foreground">
            Gere e exporte relatórios em PDF ou Excel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-muted ${report.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-red-400 hover:text-black hover:border-black"
                    
                    onClick={() => handleExport(report.id, "pdf")}
                    disabled={loading === `${report.id}-pdf`}
                  >
                    <FileDown className="h-4 w-4" />
                    {loading === `${report.id}-pdf` ? "Exportando..." : "PDF"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
                    onClick={() => handleExport(report.id, "excel")}
                    disabled={loading === `${report.id}-excel`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    {loading === `${report.id}-excel`
                      ? "Exportando..."
                      : "Excel"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
