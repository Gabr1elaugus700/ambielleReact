export interface Atividade {
  id: string;
  empresa: string;
  tipo: string;
  prazo_final: string;
  valor_sn: string;
  retencao: string;
  servico: string;
  status: "pendente" | "em_andamento" | "concluido";
  cor: "laranja" | "verde" | "azul" | "amarelo" | "roxo" | "vermelho";
}
