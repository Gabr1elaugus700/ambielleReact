"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileDown, ListChecks } from "lucide-react";

export default function RelatorioTarefas() {
  const [status, setStatus] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [prazoFinal, setPrazoFinal] = useState("");
  const [loading, setLoading] = useState(false);

  const exportar = async () => {
    setLoading(true);
    const params = [];
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (clienteId) params.push(`cliente_id=${encodeURIComponent(clienteId)}`);
    if (prazoFinal) params.push(`prazo_final=${encodeURIComponent(prazoFinal)}`);
    const url = `/api/relatorios/tarefas?${params.join("&")}`;
    const resp = await fetch(url);
    const blob = await resp.blob();
    const fileUrl = window.URL.createObjectURL(blob);
    window.open(fileUrl, "_blank");
    setLoading(false);
  };

  return (
    <main className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            <CardTitle>Relatório de Tarefas</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1">
                <option value="">Todos</option>
                <option value="Iniciado">Iniciado</option>
                <option value="Coleta_De_Informações">Coleta de Informações</option>
                <option value="Execucao">Execução</option>
                <option value="Aprovação_Cliente">Aprovação Cliente</option>
                <option value="Protocolado">Protocolado</option>
                <option value="Concluído">Concluído</option>
                <option value="Encerrado">Encerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Cliente ID</label>
              <input type="number" value={clienteId} onChange={e => setClienteId(e.target.value)} className="border rounded px-2 py-1 w-24" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Prazo Final até</label>
              <input type="date" value={prazoFinal} onChange={e => setPrazoFinal(e.target.value)} className="border rounded px-2 py-1" />
            </div>
          </div>
          <Button onClick={exportar} disabled={loading} className="mr-2">
            <FileDown className="h-4 w-4" /> Exportar PDF
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
