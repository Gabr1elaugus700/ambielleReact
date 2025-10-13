// Exemplo de uso do ClienteSelect em uma tela de Orçamentos
"use client";

import { useState } from "react";
import { ClienteSelect } from "@/components/ui/clienteSelect";
import { FormInput } from "@/components/ui/formInput";
import { Button } from "@/components/ui/button";
import { Cliente } from "@/app/features/clientes/api";

interface OrcamentoForm {
  cliente_id: number;
  cliente_nome: string;
  descricao: string;
  valor: number;
  data_vencimento: Date;
}

export function ExemploOrcamentos() {
  const [formData, setFormData] = useState<OrcamentoForm>({
    cliente_id: 0,
    cliente_nome: "",
    descricao: "",
    valor: 0,
    data_vencimento: new Date(),
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleClienteChange = (cliente: Cliente | null) => {
    setFormData(prev => ({
      ...prev,
      cliente_id: cliente?.id || 0,
      cliente_nome: cliente?.nome || ""
    }));
    
    // Limpar erro de validação quando cliente for selecionado
    if (cliente && errors.cliente) {
      setErrors(prev => ({ ...prev, cliente: "" }));
    }
  };

  const handleSubmit = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (formData.cliente_id === 0) {
      newErrors.cliente = "Cliente é obrigatório";
    }
    
    if (!formData.descricao) {
      newErrors.descricao = "Descrição é obrigatória";
    }
    
    if (formData.valor <= 0) {
      newErrors.valor = "Valor deve ser maior que zero";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Salvar orçamento...
    console.log("Salvando orçamento:", formData);
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Novo Orçamento</h2>
      
      {/* Uso do ClienteSelect reutilizável */}
      <ClienteSelect
        value={formData.cliente_id}
        onChange={handleClienteChange}
        label="Cliente"
        placeholder="Busque o cliente por nome ou razão social..."
        required
        className="w-full"
      />
      {errors.cliente && (
        <p className="text-red-500 text-sm">{errors.cliente}</p>
      )}

      <FormInput 
        label="Descrição do Orçamento"
        value={formData.descricao}
        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
        required
      />
      {errors.descricao && (
        <p className="text-red-500 text-sm">{errors.descricao}</p>
      )}

      <FormInput 
        label="Valor"
        type="number"
        value={formData.valor}
        onChange={(e) => setFormData(prev => ({ ...prev, valor: Number(e.target.value) }))}
        required
      />
      {errors.valor && (
        <p className="text-red-500 text-sm">{errors.valor}</p>
      )}

      <FormInput 
        label="Data de Vencimento"
        type="date"
        value={formData.data_vencimento.toISOString().split('T')[0]}
        onChange={(e) => setFormData(prev => ({ ...prev, data_vencimento: new Date(e.target.value) }))}
        required
      />

      <div className="flex gap-2">
        <Button 
          onClick={handleSubmit}
          className="bg-green-500 hover:bg-green-600"
        >
          Salvar Orçamento
        </Button>
        <Button 
          variant="outline"
          onClick={() => setFormData({
            cliente_id: 0,
            cliente_nome: "",
            descricao: "",
            valor: 0,
            data_vencimento: new Date(),
          })}
        >
          Limpar
        </Button>
      </div>

      {/* Mostrar dados selecionados para debug */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Dados do Formulário:</h3>
        <pre className="text-sm">{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
}