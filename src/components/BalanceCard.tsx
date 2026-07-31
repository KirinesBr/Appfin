import React, { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import AccountsSheet from './AccountsSheet'

export default function BalanceCard({ total, income, expense }: { total:number, income:number, expense:number }) {
  const [hidden, setHidden] = useState(false)
  const [openAccounts, setOpenAccounts] = useState(false)

  useEffect(() => {
    const pref = typeof window !== 'undefined' ? localStorage.getItem('hide_balance') : null
    setHidden(pref === '1')
  }, [])

  function toggleHidden() {
    const v = !hidden
    setHidden(v)
    if (typeof window !== 'undefined') localStorage.setItem('hide_balance', v ? '1' : '0')
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-zinc-500">Saldo</div>
          <div className="mt-1 text-2xl font-semibold">{hidden ? '• • • •' : `R$ ${total.toFixed(2)}`}</div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleHidden} className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {hidden ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <button onClick={() => setOpenAccounts(true)} className="p-2 rounded-lg bg-primary-500 text-white">Contas</button>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-sm text-zinc-600">
        <div>Receitas: R$ {income.toFixed(2)}</div>
        <div>Despesas: R$ {expense.toFixed(2)}</div>
      </div>

      {/* AccountsSheet placeholder: simple component not yet implemented */}
      {openAccounts && (
        <div className="mt-4 text-sm text-zinc-500">(Accounts sheet aberto - implementar)</div>
      )}
    </div>
  )
}
