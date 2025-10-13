"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cliente, getClientes } from "@/app/features/clientes/api";
import { toast } from "sonner";

interface ClienteSelectProps {
  value?: number; // ID do cliente selecionado
  onChange: (cliente: Cliente | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ClienteSelect({
  value,
  onChange,
  label = "Cliente",
  placeholder = "Digite o nome do cliente para buscar...",
  required = false,
  disabled = false,
  className = "",
}: ClienteSelectProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSearch, setClienteSearch] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar clientes na inicialização
  useEffect(() => {
    const loadClientes = async () => {
      setLoading(true);
      try {
        const clientesData = await getClientes();
        setClientes(clientesData);
        
        // Se houver um value (ID), encontrar o cliente correspondente
        if (value && value > 0) {
          const cliente = clientesData.find(c => c.id === value);
          if (cliente) {
            setSelectedCliente(cliente);
            setClienteSearch(cliente.nome);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        toast.error("Erro ao carregar lista de clientes");
      } finally {
        setLoading(false);
      }
    };

    loadClientes();
  }, [value]);

  // Filtrar clientes baseado na busca
  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    cliente.razao_social?.toLowerCase().includes(clienteSearch.toLowerCase())
  );

  // Função para selecionar um cliente
  const handleClienteSelect = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setClienteSearch(cliente.nome);
    setIsSelectOpen(false);
    onChange(cliente);
  };

  // Função para limpar seleção
  const handleClearCliente = () => {
    setSelectedCliente(null);
    setClienteSearch("");
    onChange(null);
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.cliente-select-container')) {
        setIsSelectOpen(false);
      }
    };

    if (isSelectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelectOpen]);

  // Atualizar quando value prop mudar externamente
  useEffect(() => {
    if (!value || value === 0) {
      setSelectedCliente(null);
      setClienteSearch("");
    }
  }, [value]);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-slate-950">
          {label}
          {required && " *"}
        </Label>
      )}
      <div className="relative cliente-select-container">
        <Input
          type="text"
          placeholder={loading ? "Carregando clientes..." : placeholder}
          value={clienteSearch}
          onChange={(e) => {
            setClienteSearch(e.target.value);
            setIsSelectOpen(true);
          }}
          onFocus={() => !disabled && setIsSelectOpen(true)}
          className="w-full"
          disabled={disabled || loading}
          required={required}
        />
        {selectedCliente && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearCliente}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200"
            title="Limpar seleção"
          >
            ×
          </Button>
        )}
        {isSelectOpen && !disabled && filteredClientes.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredClientes.map((cliente) => (
              <div
                key={cliente.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleClienteSelect(cliente)}
              >
                <div className="font-medium">{cliente.nome}</div>
                {cliente.razao_social && (
                  <div className="text-sm text-gray-600">{cliente.razao_social}</div>
                )}
              </div>
            ))}
          </div>
        )}
        {isSelectOpen && !disabled && clienteSearch && filteredClientes.length === 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 p-3 text-center text-gray-500">
            Nenhum cliente encontrado
          </div>
        )}
      </div>
    </div>
  );
}