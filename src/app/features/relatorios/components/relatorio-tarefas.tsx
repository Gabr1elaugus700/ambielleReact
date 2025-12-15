'use client';

import { useState } from 'react';
import { TarefasFiltros } from '../types';

export function RelatorioTarefas() {
  const [loading, setLoading] = useState(false);

  const exportar = async (format: "pdf" | "excel", filtros?: TarefasFiltros) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros?.status && filtros.status !== 'todos') params.append('status', filtros.status);
      if (filtros?.clienteId) params.append('cliente_id', filtros.clienteId);
      if (filtros?.dataInicial) params.append('dataInicial', filtros.dataInicial);
      if (filtros?.dataFinal) params.append('dataFinal', filtros.dataFinal);
      if (format) params.append('format', format);
      
      const resp = await fetch(`/api/relatorios/tarefas?${params.toString()}`);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      
      if (format === "pdf") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = "tarefas.xlsx";
        a.click();
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { exportar, loading };
}