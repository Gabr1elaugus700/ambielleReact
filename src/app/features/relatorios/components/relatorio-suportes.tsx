'use client';

import { useState } from 'react';

export type SuporteFiltros = {
  dataInicial?: string;
  dataFinal?: string;
  clienteId?: string;
};

export function RelatorioSuportes() {
  const [loading, setLoading] = useState(false);

  const exportar = async (format: "pdf" | "excel", filtros?: SuporteFiltros) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filtros?.dataInicial) params.append('dataInicial', filtros.dataInicial);
      if (filtros?.dataFinal) params.append('dataFinal', filtros.dataFinal);
      if (filtros?.clienteId) params.append('clienteId', filtros.clienteId);
      
      const resp = await fetch(`/api/relatorios/suportes?${params.toString()}`);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      
      if (format === "pdf") {
        window.open(url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = "suportes.xlsx";
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