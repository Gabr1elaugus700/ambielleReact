import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Users, BarChart3, Hourglass, FileSpreadsheet } from "lucide-react"

const items = [
  { label: "Alertas", value: "0", icon: <AlertCircle className="text-3xl" />, color: "red" },
  { label: "Clientes Atendidos", value: "6", icon: <Users className="text-3xl" />, color: "blue" },
  { label: "Relatórios", value: <BarChart3 className="text-3xl" />, icon: <FileSpreadsheet className="text-3xl" />, color: "green" },
  { label: "Em Atendimento", value: "4", icon: <Hourglass className="text-3xl" />, color: "yellow" },
] as const

const palette: Record<string, { wrap: string; icon: string }> = {
  red:    { wrap: "bg-red-100 dark:bg-red-900/50",       icon: "text-red-500 dark:text-red-400" },
  blue:   { wrap: "bg-blue-100 dark:bg-blue-900/50",     icon: "text-blue-500 dark:text-blue-400" },
  green:  { wrap: "bg-green-100 dark:bg-green-900/50",   icon: "text-green-500 dark:text-green-400" },
  yellow: { wrap: "bg-yellow-100 dark:bg-yellow-900/50", icon: "text-yellow-500 dark:text-yellow-400" },
}

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {items.map((it) => (
        <Card key={String(it.label)} className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {it.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {it.value}
            </div>
            <div className={`${palette[it.color].wrap} p-3 rounded-full`}>
              <span className={`material-icons ${palette[it.color].icon}`}>{it.icon}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}