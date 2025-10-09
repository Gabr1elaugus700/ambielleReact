// app/clientes/layout.tsx
export default function ClientesLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">

        {/* Ações comuns da seção (ex.: botão "Novo", filtros, exportar) */}
        {/* Você pode deixar o botão aqui e abrir um modal controlado no client */}
      </header>
      <div className="m-6">{children}</div>
    </section>
  )
}