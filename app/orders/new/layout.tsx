import type { ReactNode } from "react"

export default function NewOrderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">New Order Wizard</h1>
      </header>
      <main className="flex-1 p-6">{children}</main>
      <footer className="bg-gray-200 text-gray-700 p-4 text-center">
        &copy; 2024 TSW Smartlog. All rights reserved.
      </footer>
    </div>
  )
}
