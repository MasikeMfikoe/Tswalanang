import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { QueryProvider } from "@/providers/QueryProvider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AppLayout from "@/components/AppLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TSW SmartLog - Smart Logistics DMS",
  description: "Comprehensive logistics and document management system",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <QueryProvider>
              <AppLayout>{children}</AppLayout>
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
