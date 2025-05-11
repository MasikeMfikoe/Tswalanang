import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { StateProvider } from "@/contexts/StateContext"
import { QueryProvider } from "@/providers/QueryProvider"
import AppLayout from "@/components/AppLayout"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration"
import { Suspense } from "react"
import { ToastProvider } from "@/components/ui/toast-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TSW SmartLog",
  description: "Logistics Management System",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary component="RootLayout">
          <ToastProvider>
            <StateProvider>
              <QueryProvider>
                <AuthProvider>
                  <Suspense>
                    <AppLayout>{children}</AppLayout>
                  </Suspense>
                  <ServiceWorkerRegistration />
                </AuthProvider>
              </QueryProvider>
            </StateProvider>
          </ToastProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
