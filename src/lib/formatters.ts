/**
 * Formata uma data para o padrão brasileiro (dd/mm/yyyy)
 * @param dataStr - String de data (pode ser ISO ou yyyy-MM-dd)
 * @returns String formatada no padrão dd/mm/yyyy
 * @example
 * formatarData("2025-10-15") // retorna "15/10/2025"
 * formatarData(null) // retorna ""
 * formatarData("data-invalida") // retorna "data-invalida"
 */
export const formatarData = (dataStr: string | null | undefined): string => {
  if (!dataStr) return "";
  // Aceita ISO ou yyyy-MM-dd
  const d = new Date(dataStr);
  if (isNaN(d.getTime())) return dataStr; // Se não for data válida, retorna original
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

/**
 * Formata um CNPJ para o padrão brasileiro (XX.XXX.XXX/XXXX-XX)
 * @param cnpj - String contendo o CNPJ (pode conter ou não formatação)
 * @returns String formatada no padrão XX.XXX.XXX/XXXX-XX
 * @example
 * formatarCNPJ("12345678000199") // retorna "12.345.678/0001-99"
 * formatarCNPJ("") // retorna ""
 */
export const formatarCNPJ = (cnpj: string): string => {
  if (!cnpj) return "";
  const numeros = cnpj.replace(/\D/g, "");
  return numeros
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

/**
 * Formata um telefone para o padrão brasileiro
 * - Fixo: (XX) XXXX-XXXX
 * - Celular: (XX) XXXXX-XXXX
 * @param telefone - String contendo o telefone (pode conter ou não formatação)
 * @returns String formatada no padrão (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
 * @example
 * formatarTelefone("1234567890") // retorna "(12) 3456-7890"
 * formatarTelefone("12345678901") // retorna "(12) 34567-8901"
 * formatarTelefone("") // retorna ""
 */
export const formatarTelefone = (telefone: string): string => {
  if (!telefone) return "";
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length <= 10) {
    return numeros
      .slice(0, 10)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    return numeros
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
};