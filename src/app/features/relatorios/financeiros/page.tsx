"use client";
import { useState } from "react";

type RelatorioFinanceiroOptions = {
  tipo: "tarefas" | "suportes" | "todos";
};
export default function RelatorioFinanceiro() {
  const [tipo, setTipo] = useState<RelatorioFinanceiroOptions["tipo"]>("todos");
  const [loading, setLoading] = useState(false);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const exportarPDF = async () => {
    setLoading(true);
    const params = [
        `tipo=${tipo}`,
        dataInicio ? `dataInicio=${dataInicio}` : null,
        dataFim ? `dataFim=${dataFim}` : null
    ].filter(Boolean).join("&");
    const resp = await fetch(`/api/relatorios/financeiros?${params}`);
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
    setLoading(false);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Relatório Financeiro</h1>
      <div className="flex gap-4 mb-4 items-center">
        <label className="font-semibold">Tipo:</label>
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value as RelatorioFinanceiroOptions["tipo"])}
          className="border rounded px-2 py-1"
        >
          <option value="todos">Tarefas e Suportes</option>
          <option value="tarefas">Somente Tarefas</option>
          <option value="suportes">Somente Suportes</option>
        </select>
        <label className="font-semibold">Data Inicial:</label>
        <input
          type="date"
          value={dataInicio}
          onChange={e => setDataInicio(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <label className="font-semibold">Data Final:</label>
        <input
          type="date"
          value={dataFim}
          onChange={e => setDataFim(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={exportarPDF}
          className="bg-green-600 text-white px-4 py-1 rounded"
          disabled={loading}
        >
          Exportar PDF
        </button>
      </div>
    </main>
  );
}
