import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'filter'
  filterColor?: 'blue' | 'green' | 'yellow' | 'red'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  isActive?: boolean
  icon?: React.ReactNode
}

export default function Button({
  className,
  children,
  variant = 'primary',
  filterColor = 'blue',
  size = 'md',
  isLoading = false,
  isActive = false,
  icon,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    outline:
      'border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-dark-border-medium dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:text-gray-100',
    ghost:
      'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:text-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    filter: '',
  }

  const filterVariants = {
    blue: isActive
      ? 'bg-blue-600 text-white dark:bg-blue-500 shadow-lg scale-105 focus:ring-blue-500'
      : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300 hover:scale-105 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600 focus:ring-blue-500',
    green: isActive
      ? 'bg-green-600 text-white dark:bg-green-500 shadow-lg scale-105 focus:ring-green-500'
      : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300 hover:scale-105 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600 focus:ring-green-500',
    yellow: isActive
      ? 'bg-yellow-600 text-white dark:bg-yellow-600 shadow-lg scale-105 focus:ring-yellow-500'
      : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300 hover:scale-105 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600 focus:ring-yellow-500',
    red: isActive
      ? 'bg-red-600 text-white dark:bg-red-500 shadow-lg scale-105 focus:ring-red-500'
      : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300 hover:scale-105 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600 focus:ring-red-500',
  }

  const sizes = {
    sm: 'px-3 py-2 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  }

  const variantStyles = variant === 'filter' ? filterVariants[filterColor] : variants[variant]

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles,
        sizes[size],
        variant === 'filter' && 'flex items-center gap-1.5',
        isLoading && 'opacity-70 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      aria-pressed={variant === 'filter' ? isActive : undefined}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        <>
          {icon && icon}
          {children}
        </>
      )}
    </button>
  )
}
