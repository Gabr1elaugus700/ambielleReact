import { StatsCards } from "@/app/features/home/components/stats-cards"
import { Kanban } from "@/app/features/home/components/kanban"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Olá, Gisele!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Veja o que temos a fazer:</p>
        </div>
        <StatsCards />
        <Kanban />
      </main>
    </div>
  )
}