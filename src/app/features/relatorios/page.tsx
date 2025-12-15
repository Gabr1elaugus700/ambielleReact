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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  {
    id: "atividades",
    title: "Relatório de Atividades",
    description: "Atividades realizadas e prazos cumpridos",
    icon: FileText,
    color: "text-status-protocolado",
  },
];

type DialogConfig = {
  reportId: string;
  format: "pdf" | "excel";
  dataInicio: string;
  dataFim: string;
  filtroStatus?: string;
  filtroCliente?: string;
  filtroIncluirSuportes?: boolean;
};

export default function Relatorios() {
  const { clientes } = useClientes();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<DialogConfig>({
    reportId: "",
    format: "pdf",
    dataInicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    dataFim: new Date().toISOString().split('T')[0],
    filtroStatus: "",
    filtroCliente: "",
    filtroIncluirSuportes: false,
  });

  const openExportDialog = (reportId: string, format: "pdf" | "excel") => {
    setCurrentConfig({
      ...currentConfig,
      reportId,
      format,
    });
    setDialogOpen(true);
  };

  const handleExport = async () => {
    setLoading(`${currentConfig.reportId}-${currentConfig.format}`);
    setDialogOpen(false);

    try {
      // Construir query params
      const params = new URLSearchParams({
        format: currentConfig.format,
        dataInicio: currentConfig.dataInicio,
        dataFim: currentConfig.dataFim,
      });
      
      if (currentConfig.filtroStatus && currentConfig.filtroStatus !== "ALL") {
        params.append('status', currentConfig.filtroStatus);
      }
      
      if (currentConfig.filtroCliente && currentConfig.filtroCliente !== "ALL") {
        params.append('cliente_id', currentConfig.filtroCliente);
      }
      
      if (currentConfig.reportId === "financeiro" && currentConfig.filtroIncluirSuportes) {
        params.append('incluirSuportes', 'true');
      }

      // Fazer a requisição
      const endpoint = `/api/relatorios/${currentConfig.reportId}?${params.toString()}`;
      const resp = await fetch(endpoint);

      if (!resp.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      const blob = await resp.blob();
      
      // Download do arquivo
      if (currentConfig.format === "pdf") {
        // Abrir PDF em nova aba
        const url = window.URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      } else {
        // Download do Excel
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `relatorio-${currentConfig.reportId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Relatório exportado com sucesso!",
        description: `O relatório foi exportado em formato ${currentConfig.format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro ao exportar relatório",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
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
                    
                    onClick={() => openExportDialog(report.id, "pdf")}
                    disabled={loading === `${report.id}-pdf`}
                  >
                    <FileDown className="h-4 w-4" />
                    {loading === `${report.id}-pdf` ? "Exportando..." : "PDF"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 px-2 py-1 text-xs rounded border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
                    onClick={() => openExportDialog(report.id, "excel")}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Exportação</DialogTitle>
            <DialogDescription>
              Configure os filtros e período para o relatório
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={currentConfig.dataInicio}
                  onChange={(e) =>
                    setCurrentConfig({ ...currentConfig, dataInicio: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={currentConfig.dataFim}
                  onChange={(e) =>
                    setCurrentConfig({ ...currentConfig, dataFim: e.target.value })
                  }
                />
              </div>
            </div>

            {(currentConfig.reportId === "tarefas") && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={currentConfig.filtroStatus}
                  onValueChange={(value) =>
                    setCurrentConfig({ ...currentConfig, filtroStatus: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    <SelectItem value="Iniciado">Iniciado</SelectItem>
                    <SelectItem value="Coleta_De_Informações">Coleta de Informações</SelectItem>
                    <SelectItem value="Execucao">Execução</SelectItem>
                    <SelectItem value="Aprovação_Cliente">Aprovação Cliente</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Encerrado">Encerrado</SelectItem>
                    <SelectItem value="Protocolado">Protocolado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentConfig.reportId === "suporte" && (
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente (Opcional)</Label>
                <Select
                  value={currentConfig.filtroCliente}
                  onValueChange={(value) =>
                    setCurrentConfig({ ...currentConfig, filtroCliente: value })
                  }
                >
                  <SelectTrigger id="cliente">
                    <SelectValue placeholder="Todos os clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    {clientes?.map((cliente) => (
                      <SelectItem key={cliente.id} value={String(cliente.id)}>
                        {cliente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentConfig.reportId === "financeiro" && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="incluirSuportes"
                  checked={currentConfig.filtroIncluirSuportes}
                  onChange={(e) =>
                    setCurrentConfig({ ...currentConfig, filtroIncluirSuportes: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="incluirSuportes" className="cursor-pointer">
                  Incluir suportes no relatório
                </Label>
              </div>
            )}

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar {currentConfig.format.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
