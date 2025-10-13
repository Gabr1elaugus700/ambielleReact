"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { SuporteInput } from "@/app/features/suportes/api";
import { useEffect, useState } from "react";
import { Cliente } from "@/app/features/clientes/api";
import { FormInput } from "@/components/ui/formInput";
import { ClienteSelect } from "@/components/ui/clienteSelect";

type ModalsuportesProps = {
  onClose: () => void;
  onSave: (data: SuporteInput) => void;
  suporte?: SuporteInput; // Opcional, caso queira usar para edição futuramente
};

export function ModalSuportes({
  onClose,
  onSave,
  suporte,
}: ModalsuportesProps) {
  const [cliente_id, setCliente_id] = useState(suporte?.cliente_id || 0);
  const [descricao, setDescricao] = useState(suporte?.descricao || "");
  const [valor_hora, setValor_hora] = useState(suporte?.valor_hora || 0);
  const [data_suporte, setData_suporte] = useState(
    suporte?.data_suporte || new Date()
  );
  const [hora_inicio, setHora_inicio] = useState(
    suporte?.hora_inicio ? new Date(suporte.hora_inicio).toTimeString().substring(0,5) : ""
  );
  const [hora_fim, setHora_fim] = useState(
    suporte?.hora_fim ? new Date(suporte.hora_fim).toTimeString().substring(0,5) : ""
  );
  const [tempo_suporte, setTempo_suporte] = useState(
    suporte?.tempo_suporte || 0
  );
  const [valor_total, setValor_total] = useState(suporte?.valor_total || 0);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  // Função para calcular tempo de suporte em horas
  const calcularTempoSuporte = (inicio: string, fim: string): number => {
    if (!inicio || !fim) return 0;
    
    const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
    const [horaFim, minutoFim] = fim.split(':').map(Number);
    
    const inicioMinutos = horaInicio * 60 + minutoInicio;
    const fimMinutos = horaFim * 60 + minutoFim;
    
    const diferencaMinutos = fimMinutos - inicioMinutos;
    return Math.max(0, diferencaMinutos / 60); // Retorna em horas
  };

  // Função para calcular valor total
  const calcularValorTotal = (valorHora: number, tempoSuporteHoras: number): number => {
    return valorHora * tempoSuporteHoras;
  };

  // useEffect para recalcular quando hora_inicio ou hora_fim mudam
  useEffect(() => {
    const novoTempoSuporte = calcularTempoSuporte(hora_inicio, hora_fim);
    setTempo_suporte(novoTempoSuporte);
    
    const novoValorTotal = calcularValorTotal(valor_hora, novoTempoSuporte);
    setValor_total(novoValorTotal);
  }, [hora_inicio, hora_fim, valor_hora]);

  // Função para lidar com mudança de cliente
  const handleClienteChange = (cliente: Cliente | null) => {
    setCliente_id(cliente?.id || 0);
  };

  useEffect(() => {
    setCliente_id(suporte?.cliente_id || 0);
    setDescricao(suporte?.descricao || "");
    setValor_hora(suporte?.valor_hora || 0);
    setData_suporte(suporte?.data_suporte || new Date());
    setHora_inicio(suporte?.hora_inicio ? new Date(suporte.hora_inicio).toTimeString().substring(0,5) : "");
    setHora_fim(suporte?.hora_fim ? new Date(suporte.hora_fim).toTimeString().substring(0,5) : "");
    setTempo_suporte(suporte?.tempo_suporte || 0);
    setValor_total(suporte?.valor_total || 0);
  }, [suporte]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cliente_id === 0) {
      toast.error("Por favor, selecione um cliente");
      return;
    }

    if (!hora_inicio || !hora_fim) {
      toast.error("Por favor, preencha as horas de início e fim");
      return;
    }
    
    setSaving(true);
    setError(false);
    try {
      // Converter strings de hora para Date objects
      const hoje = new Date();
      const [horaInicioH, horaInicioM] = hora_inicio.split(':').map(Number);
      const [horaFimH, horaFimM] = hora_fim.split(':').map(Number);
      
      const horaInicioDate = new Date(hoje);
      horaInicioDate.setHours(horaInicioH, horaInicioM, 0, 0);
      
      const horaFimDate = new Date(hoje);
      horaFimDate.setHours(horaFimH, horaFimM, 0, 0);

      onSave({
        cliente_id,
        descricao,
        valor_hora,
        data_suporte,
        hora_inicio: horaInicioDate,
        hora_fim: horaFimDate,
        tempo_suporte,
        valor_total,
      });
      console.log("Erro" + error);
      toast.success("Cadastro de Suporte Realizado!");
    } catch {
      setSaving(false);
      setError(true);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-modal-light dark:bg-modal-dark">
        <DialogHeader>
          <DialogTitle>
            {suporte ? "Editar Suporte" : "Cadastro de Suporte"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do suporte e clique em salvar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-6 py-4">
            <ClienteSelect
              value={cliente_id}
              onChange={handleClienteChange}
              required
            />
            <FormInput label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} required/>
            <FormInput label="Valor Hora" type="number" value={valor_hora} onChange={(e) => setValor_hora(Number(e.target.value))} required/>
            <FormInput label="Data do Suporte" type="date" value={data_suporte.toISOString().split('T')[0]} onChange={(e) => setData_suporte(new Date(e.target.value))} required/>
            <FormInput label="Hora Início" type="time" value={hora_inicio} onChange={(e) => {
              setHora_inicio(e.target.value);
            }} required/>
            <FormInput label="Hora Fim" type="time" value={hora_fim} onChange={(e) => {
              setHora_fim(e.target.value);
            }} required/>
            <FormInput label="Tempo Suporte (horas)" type="number" value={tempo_suporte.toFixed(2)} onChange={() => {}} disabled required/>
            <FormInput label="Valor Total" type="number" value={valor_total.toFixed(2)} onChange={() => {}} disabled required/>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                className="px-2 py-1 text-sm font-medium rounded border border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-red-400 hover:text-black hover:border-black"
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="outline"
              type="button"
              disabled={saving}
              className="px-2 py-1 text-sm font-medium rounded border border-black/30 text-black hover:translate-transition hover:scale-105 hover:bg-green-400 hover:text-black hover:border-black"
            >
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
