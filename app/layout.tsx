import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Appfin - Finanças Pessoais',
  description: 'Aplicativo mobile-first de gestão financeira'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <main className="min-h-screen max-w-md mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
