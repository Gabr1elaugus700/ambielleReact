"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TarefasFiltros, SuporteFiltros, FinanceiroFiltros, ClientesFiltros } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RelatorioClientes } from "./components/relatorio-clientes";
import { RelatorioTarefas } from "./components/relatorio-tarefas";
import { RelatorioSuportes } from "./components/relatorio-suportes";
import { RelatorioFinanceiro } from "./components/relatorio-financeiro";
import { ModalFiltrosTarefas } from "./components/modais/modal-filtros-tarefas";
import { ModalFiltrosSuportes } from "./components/modais/modal-filtros-suportes";
import { ModalFiltrosFinanceiro } from "./components/modais/modal-filtros-financeiro";
import { ModalFiltrosClientes } from "./components/modais/modal-filtros-clientes";
import {
  FileDown,
  FileSpreadsheet,
  DollarSign,
  Users,
  Headphones,
  ClipboardList,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClientes } from "../clientes/hooks";

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
];

export default function Relatorios() {
  const { clientes } = useClientes();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState<string | null>(null);
  
  // Usar os hooks dos relatórios
  const relatorioClientes = RelatorioClientes();
  const relatorioTarefas = RelatorioTarefas();
  const relatorioSuportes = RelatorioSuportes();
  const relatorioFinanceiro = RelatorioFinanceiro();

  const handleExport = async (reportId: string, format: "pdf" | "excel") => {
    // Se o relatório precisa de filtros, abre o modal correspondente
    if (['financeiro', 'suporte', 'tarefas', 'clientes'].includes(reportId)) {
      setModalAberto(reportId);
      return;
    }

    // Para relatórios sem filtros, exporta diretamente
    setLoading(`${reportId}-${format}`);

    try {
      if (reportId === 'clientes') {
        await relatorioClientes.exportar(format);
      }

      toast({
        title: "Relatório exportado com sucesso!",
        description: `O relatório foi exportado em formato ${format.toUpperCase()}.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao exportar relatório" + err,
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  // Funções para lidar com a exportação com filtros
  const handleExportComFiltros = async (
    reportId: string, 
    format: "pdf" | "excel", 
    filtros: TarefasFiltros | SuporteFiltros | FinanceiroFiltros | ClientesFiltros
  ) => {
    setLoading(`${reportId}-${format}`);

    try {
      switch (reportId) {
        case 'financeiro':
          await relatorioFinanceiro.exportar(format, filtros as FinanceiroFiltros);
          break;
        case 'suporte':
          await relatorioSuportes.exportar(format, filtros as SuporteFiltros);
          break;
        case 'tarefas':
          await relatorioTarefas.exportar(format, filtros as TarefasFiltros);
          break;
        case 'clientes':
          await relatorioClientes.exportar(format, filtros as ClientesFiltros);
          break;
      }

      toast({
        title: "Relatório exportado com sucesso!",
        description: `O relatório foi exportado em formato ${format.toUpperCase()}.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao exportar relatório" + err,
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
      setModalAberto(null);
    }
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

      {/* Modais de Filtros */}
      <ModalFiltrosFinanceiro 
        open={modalAberto === 'financeiro'}
        onClose={() => setModalAberto(null)}
        onExport={(format, filtros) => handleExportComFiltros('financeiro', format, filtros)}
      />

      <ModalFiltrosSuportes
        open={modalAberto === 'suporte'}
        onClose={() => setModalAberto(null)}
        onExport={(format, filtros) => handleExportComFiltros('suporte', format, filtros)}
      />

      <ModalFiltrosTarefas
        open={modalAberto === 'tarefas'}
        onClose={() => setModalAberto(null)}
        onExport={(format, filtros) => handleExportComFiltros('tarefas', format, filtros)}
      />

      <ModalFiltrosClientes
        open={modalAberto === 'clientes'}
        onClose={() => setModalAberto(null)}
        onExport={(format, filtros) => handleExportComFiltros('clientes', format, filtros)}
      />
    </main>
  );
}
