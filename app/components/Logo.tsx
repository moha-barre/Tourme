import { Trophy } from 'lucide-react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center space-x-2 font-bold ${sizeClasses[size]} ${className}`}>
      <div className="relative">
        <Trophy className="h-6 w-6 text-blue-600" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
      </div>
      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
        Tourme
      </span>
    </div>
  )
} 