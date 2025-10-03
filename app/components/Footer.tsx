'use client'

import { appConfig } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ArrowUpRightIcon, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

const Footer = () => {
  const { theme, setTheme } = useTheme()

  const handleChangeTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    }
  }

  return (
    <nav className={cn('absolute bottom-4 left-4 hidden md:block')}>
      <div className="flex items-center space-x-2">
        <a
          href={appConfig.repositoryUrl}
          target="_blank"
          className="outline outline-zinc-500 cursor-pointer rounded-2xl py-1 px-2 flex items-start space-x-2"
          rel="noreferrer"
        >
          <span className="text-sm">GitHub</span>
          <ArrowUpRightIcon size={14} className="text-zinc-500" />
        </a>
        <button
          onClick={handleChangeTheme}
          className="outline outline-zinc-500 cursor-pointer rounded-2xl py-1 px-2 flex items-center space-x-2"
        >
          <Sun
            size={14}
            className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
          />
          <Moon
            size={14}
            className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
          />
          <span className="text-sm">Theme</span>
        </button>
      </div>
    </nav>
  )
}

export default Footer
