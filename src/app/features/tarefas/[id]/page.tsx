"use client"
import { useParams } from "next/navigation"

export default function TarefaDetalhePage() {
  const { id } = useParams() // pega o parâmetro da URL

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-700">
        Detalhes da Tarefa
      </h1>

      <p className="mt-2 text-gray-700">
        ID da tarefa: <strong>{id}</strong>
      </p>

      {/* Aqui futuramente você busca os dados no backend */}
    </div>
  )
}
