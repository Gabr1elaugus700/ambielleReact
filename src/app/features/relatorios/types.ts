export type TarefasFiltros = {
  status?: string;
  dataInicial?: string;
  dataFinal?: string;
  clienteId?: string;
};

export type SuporteFiltros = {
  dataInicial?: string;
  dataFinal?: string;
  clienteId?: string;
};

export type FinanceiroFiltros = {
  dataInicio?: string;
  dataFim?: string;
  tipo?: 'todos' | 'tarefas' | 'suportes';
};

export type ClientesFiltros = {
  dataInicial?: string;
  dataFinal?: string;
};