# ClienteSelect - Componente Reutilizável

O `ClienteSelect` é um componente reutilizável que fornece um campo de seleção de clientes com busca em tempo real.

## Localização
```
src/components/ui/clienteSelect.tsx
```

## Funcionalidades

- 🔍 **Busca em tempo real** por nome ou razão social
- 📋 **Dropdown interativo** com lista de clientes
- ✨ **Interface limpa** com botão para limpar seleção
- 🎯 **Foco automático** e controle de estado
- ⚡ **Carregamento lazy** dos clientes
- 🛡️ **Validação** e estados de erro
- ♿ **Acessibilidade** completa

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `value` | `number?` | - | ID do cliente selecionado |
| `onChange` | `(cliente: Cliente \| null) => void` | **obrigatório** | Callback quando cliente é selecionado/removido |
| `label` | `string?` | "Cliente" | Label do campo |
| `placeholder` | `string?` | "Digite o nome..." | Placeholder do input |
| `required` | `boolean?` | `false` | Se o campo é obrigatório |
| `disabled` | `boolean?` | `false` | Se o campo está desabilitado |
| `className` | `string?` | "" | Classes CSS adicionais |

## Exemplo de Uso

### Uso Básico
```tsx
import { ClienteSelect } from "@/components/ui/clienteSelect";
import { Cliente } from "@/app/features/clientes/api";

function MeuFormulario() {
  const [clienteId, setClienteId] = useState<number>(0);

  const handleClienteChange = (cliente: Cliente | null) => {
    setClienteId(cliente?.id || 0);
    console.log("Cliente selecionado:", cliente);
  };

  return (
    <ClienteSelect
      value={clienteId}
      onChange={handleClienteChange}
      required
    />
  );
}
```

### Uso Avançado
```tsx
<ClienteSelect
  value={formData.cliente_id}
  onChange={(cliente) => {
    setFormData(prev => ({
      ...prev,
      cliente_id: cliente?.id || 0,
      cliente_nome: cliente?.nome || ""
    }));
  }}
  label="Selecione o Cliente"
  placeholder="Busque por nome ou razão social..."
  required
  className="col-span-2"
/>
```

### Uso em Formulários com Validação
```tsx
const [errors, setErrors] = useState<{cliente?: string}>({});

<ClienteSelect
  value={cliente_id}
  onChange={(cliente) => {
    setCliente_id(cliente?.id || 0);
    // Limpar erro quando cliente for selecionado
    if (cliente) {
      setErrors(prev => ({ ...prev, cliente: undefined }));
    }
  }}
  required
/>
{errors.cliente && (
  <p className="text-red-500 text-sm">{errors.cliente}</p>
)}
```

## Comportamento

### Estados Visuais
- **Carregando**: Mostra "Carregando clientes..." no placeholder
- **Busca vazia**: Mostra "Nenhum cliente encontrado"
- **Cliente selecionado**: Mostra botão "×" para limpar
- **Hover**: Destaca opções ao passar o mouse

### Interações
- **Digitar**: Filtra clientes em tempo real
- **Clicar**: Seleciona cliente e fecha dropdown
- **Clicar fora**: Fecha dropdown automaticamente
- **Limpar**: Remove seleção e limpa texto

### Acessibilidade
- Labels apropriados para screen readers
- Navegação por teclado
- Estados de foco bem definidos
- Atributos ARIA quando necessário

## Dependências

- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/button`
- `@/app/features/clientes/api`
- `sonner` (para toasts)

## Customização

O componente usa classes Tailwind CSS que podem ser sobrescritas:

```tsx
<ClienteSelect
  className="my-custom-spacing"
  // A classe personalizada será adicionada ao container principal
/>
```

## Casos de Uso

✅ **Ideal para:**
- Formulários de criação/edição que precisam selecionar clientes
- Qualquer tela que precise de seleção de cliente com busca
- Campos obrigatórios ou opcionais de cliente

❌ **Não recomendado para:**
- Listas muito grandes (>1000 clientes) sem paginação
- Casos onde você precisa de seleção múltipla
- Formulários que precisam de validação customizada complexa