"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileDown, FileSpreadsheet, Users } from "lucide-react";
// import { Cliente } from "../../clientes/api";

export default function RelatorioClientes() {
  const [loading, setLoading] = useState(false);


  const exportar = async (format: "pdf" | "excel") => {
    setLoading(true);
    const resp = await fetch(`/api/relatorios/clientes?format=${format}`);
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
          <Button onClick={() => exportar("pdf") } disabled={loading} className="mr-2">
            <FileDown className="h-4 w-4" /> Exportar PDF
          </Button>
          
        </CardContent>
      </Card>
    </main>
  );
}
