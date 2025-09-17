import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";

// App Config:
import { appConfig } from "@/lib/utils";

// Styles:
import "./globals.css";
import { cn } from "@/lib/utils";

// Fonts:
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: "600",
  preload: true,
});

// Global layout & providers:
import { ThemeProvider } from "@/app/ThemeProvider"

// Metadata:
export const metadata: Metadata = {
  description: appConfig.description,
  metadataBase: new URL(appConfig.prodUrl),
  alternates: {
    canonical: "/",
  },
  title: {
    default: `${appConfig.title} - ${appConfig.description}`,
    template: `%s - ${appConfig.title}`,
  },
  icons: [
    { rel: "icon", url: "/logo_ico.ico" },
    { rel: "icon", url: "/logo_svg.svg", type: "image/svg+xml" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `${inter.variable} ${jetbrainsMono.variable}`,
          "font-sans antialiased",
          "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          { children }
        </ThemeProvider>
      </body>
    </html>
  );
}