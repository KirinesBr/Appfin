import React from 'react'
import BalanceCard from '../src/components/BalanceCard'

export default function Page() {
  // placeholder values
  const total = 1234.56
  const income = 5000
  const expense = 3765.44

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Olá, Usuário</h1>
          <p className="text-sm text-zinc-500">Bem-vindo ao Appfin</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg bg-zinc-100">🔔</button>
          <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center">U</div>
        </div>
      </header>

      <section>
        <BalanceCard total={total} income={income} expense={expense} />
      </section>

      <section>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4">(Componentes adicionais serão implementados)</div>
      </section>

      <nav className="fixed bottom-4 left-0 right-0 mx-auto max-w-md px-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-3 flex justify-between shadow-md">
          <button className="text-center">Início</button>
          <button>Cartões</button>
          <button className="bg-primary-500 text-white rounded-full w-12 h-12 -mt-6">+</button>
          <button>Transações</button>
          <button>Config</button>
        </div>
      </nav>
    </div>
  )
}
