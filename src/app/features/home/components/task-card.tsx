'use client'

type Props = {
  title: string
  subtitle: string
  onClick?: () => void
}

export function TaskCard({ title, subtitle, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-white/70 dark:bg-gray-800/50 p-4 rounded-lg cursor-pointer transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}