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
      if (filtros?.tipo) params.append('tipo', filtros.tipo);
      
      const resp = await fetch(`/api/relatorios/financeiros?${params.toString()}`);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      
      if (format === "pdf") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = "financeiro.xlsx";
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