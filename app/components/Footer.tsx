'use client'

import { appConfig } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ArrowUpRightIcon, Moon, Sun, Info, Github } from 'lucide-react'
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
    <footer className="relative w-full mt-16 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Disclaimer Section */}
        <div className="mb-6 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-zinc-500 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p className="mb-2">
                <strong className="text-zinc-700 dark:text-zinc-300">Disclaimer:</strong> Data presented may not represent all flights. Information is subject to change and is for informational purposes only.
              </p>
              <p>
                Avianca and all related trademarks, logos, and brand names are the property of their respective owners. This is an independent tracking service and is not affiliated with or endorsed by Avianca.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              AirTrack
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Flight tracking & statistics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={appConfig.repositoryUrl}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              rel="noreferrer"
              aria-label="View source code on GitHub"
            >
              <Github size={16} />
              <span className="hidden sm:inline">GitHub</span>
              <ArrowUpRightIcon size={14} className="text-zinc-500" />
            </a>
            <button
              onClick={handleChangeTheme}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              aria-label="Toggle theme"
            >
              <Sun
                size={16}
                className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
              />
              <Moon
                size={16}
                className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
              />
              <span className="hidden sm:inline">Theme</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex flex-col items-center gap-2">

            <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
              Built by{' '}
              <a
                href="https://github.com/jbarriospd"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline decoration-dotted underline-offset-2"
              >
                jbarriospd
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
