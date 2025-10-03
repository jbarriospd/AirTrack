'use client'

import BackgroundGradient from '@/app/components/BackgroungGradient'
import { cn } from '@/lib/utils'
import Footer from '@/app/components/Footer'
import Logo from '@/app/components/ui/Logo'

export default function HomePage() {
  return (
    <main>
      <BackgroundGradient />
      <section className="relative flex min-h-[90vh] w-full items-center justify-center px-4 md:px-4 lg:px-8">
        <div className="w-full max-w-4xl items-center">
          <div className="flex flex-col items-center space-y-6 text-center">
            <Logo
              width={70}
              height={70}
              className="animate-in fill-mode-backwards fade-in slide-in-from-bottom-2 delay-100 duration-500"
            />
            <h1
              className={cn(
                'text-3xl font-bold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl dark:text-white',
                'animate-in fill-mode-backwards fade-in slide-in-from-bottom-2 delay-200 duration-500'
              )}
            >
              Estado de Vuelos Avianca
            </h1>
            <p
              className={cn(
                'max-w-md text-lg text-zinc-600 dark:text-zinc-400 font-mono',
                'animate-in fill-mode-backwards fade-in slide-in-from-bottom-2 delay-500 duration-500'
              )}
            >
              Dashboard de estado de vuelos Avianca en tiempo real
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
