"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileDown, Users } from "lucide-react";
import { useClientes } from "../../clientes/hooks";

type Atividade = {
  id: string;
  empresa: string;
  tipo: string;
  servico: string;
  prazo_final: string;
  status: string;
};

type ClienteComAtividades = {
  id: string;
  nome: string;
  atividades: Atividade[];
};

export default function RelatorioClientes() {
  const [loading, setLoading] = useState(false);
  const { clientes, isLoading } = useClientes();
  const [clientesComAtividades, setClientesComAtividades] = useState<ClienteComAtividades[]>([]);

  useEffect(() => {
    const carregarAtividades = async () => {
      if (!clientes) return;
      
      const clientesComDados = await Promise.all(
        clientes.map(async (cliente) => {
          // Buscar atividades do cliente (ajuste o endpoint conforme sua API)
          const resp = await fetch(`/api/tarefas?clienteId=${cliente.id}`);
          const atividades = resp.ok ? await resp.json() : [];
          return {
            ...cliente,
            id: String(cliente.id),
            atividades,
          };
        })
      );
      setClientesComAtividades(clientesComDados);
    };

    carregarAtividades();
  }, [clientes]);

  const exportar = async (format: "pdf" | "excel") => {
    setLoading(true);
    const resp = await fetch(`/api/relatorios/clientes?format=${format}`);
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    if (format === "pdf") {
      window.open(url, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = "clientes.xlsx";
      a.click();
    }
    setLoading(false);
  };

  return (
    <main className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>Relatório de Clientes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => exportar("pdf")} disabled={loading} className="mr-2 mb-4">
            <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
          </Button>

          {isLoading ? (
            <p>Carregando clientes...</p>
          ) : (
            <div className="space-y-6 mt-4">
              {clientesComAtividades.map((cliente) => (
                <div key={cliente.id} className="border-b pb-4">
                  <h3 className="font-bold text-lg mb-2">{cliente.nome}</h3>
                  {cliente.atividades && cliente.atividades.length > 0 ? (
                    <div className="ml-6 space-y-2">
                      {cliente.atividades.map((atividade: Atividade) => (
                        <div key={atividade.id} className="text-sm text-gray-700">
                          • {atividade.servico} - {atividade.tipo} ({atividade.status})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ml-6 text-sm text-gray-500 italic">Nenhuma atividade registrada</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
