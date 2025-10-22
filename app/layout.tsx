import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter, JetBrains_Mono } from 'next/font/google'

import { appConfig } from '@/lib/utils'

import './globals.css'
import { cn } from '@/lib/utils'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: '600',
  preload: true,
  fallback: ['monospace'],
  adjustFontFallback: true,
})

import { ThemeProvider } from '@/app/ThemeProvider'

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.prodUrl),
  title: {
    default: appConfig.title,
    template: `%s | AirTrack`,
  },
  description: appConfig.description,
  applicationName: 'AirTrack',
  keywords: [
    'Avianca',
    'flight tracking',
    'flight status',
    'flight delays',
    'airline statistics',
    'on-time performance',
    'Colombia flights',
    'AirTrack',
    'flight punctuality',
    'aviation data',
    'real-time flight tracking',
  ],
  authors: [{ name: 'AirTrack Team' }],
  creator: 'AirTrack',
  publisher: 'AirTrack',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: appConfig.prodUrl,
    title: appConfig.title,
    description: appConfig.description,
    siteName: 'AirTrack',
    images: [
      {
        url: '/logo_svg.svg',
        width: 1200,
        height: 630,
        alt: 'AirTrack - Avianca Flight Statistics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: appConfig.title,
    description: appConfig.description,
    images: ['/logo_svg.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: [
    { rel: 'icon', url: '/logo_ico.ico' },
    { rel: 'icon', url: '/logo_svg.svg', type: 'image/svg+xml' },
    { rel: 'apple-touch-icon', url: '/logo_svg.svg' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "ttvinlhjzx");
            `,
          }}
        />
      </head>
      <body
        className={cn(
          `${inter.variable} ${jetbrainsMono.variable}`,
          'font-sans antialiased',
          'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50'
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
