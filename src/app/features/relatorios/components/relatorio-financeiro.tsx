'use client';

import { useState } from 'react';
import { FinanceiroFiltros } from '../types';

export function RelatorioFinanceiro() {
  const [loading, setLoading] = useState(false);

  const exportar = async (format: "pdf" | "excel", filtros?: FinanceiroFiltros) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
      if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);
      
      // Converter tipo para incluirSuportes
      if (filtros?.tipo === 'todos' || filtros?.tipo === 'suportes') {
        params.append('tipo', filtros.tipo);
      } else if (filtros?.tipo === 'tarefas') {
        params.append('tipo', 'tarefas');
      }
      
      const resp = await fetch(`/api/relatorios/financeiro?${params.toString()}`);
      
      if (!resp.ok) {
        throw new Error('Erro ao gerar relatório');
      }
      
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      
      if (format === "pdf") {
        window.open(url, "_blank");
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = "relatorio-financeiro.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
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