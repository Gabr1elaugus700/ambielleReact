'use client';

import { useState } from 'react';
import { ClientesFiltros } from '../types';

export function RelatorioClientes() {
  const [loading, setLoading] = useState(false);

  const exportar = async (format: "pdf" | "excel", filtros?: ClientesFiltros) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      // Adiciona os filtros de data se fornecidos
      if (filtros?.dataInicial) params.append('dataInicial', filtros.dataInicial);
      if (filtros?.dataFinal) params.append('dataFinal', filtros.dataFinal);
      
      const resp = await fetch(`/api/relatorios/clientes?${params.toString()}`);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      
      if (format === "pdf") {
        window.open(url, "_blank"); // Abre o PDF em nova aba
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = "clientes.xlsx";
        a.click();
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  return { exportar, loading };
}