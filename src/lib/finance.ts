import moment from 'moment'
import { Transaction } from '@prisma/client'

export function invoiceMonthForTransaction(txDate: Date, closingDay: number) {
  const d = moment(txDate)
  const day = d.date()
  let invoiceMoment = d.clone()
  const lastDay = d.clone().endOf('month').date()
  const normalizedClosing = Math.min(closingDay, lastDay)

  if (day > normalizedClosing) {
    invoiceMoment = invoiceMoment.add(1, 'month')
  }
  return { invoiceMonth: invoiceMoment.month() + 1, invoiceYear: invoiceMoment.year() }
}

export function calculateMonthlyBalance(transactions: Transaction[], targetMonth: number, targetYear: number) {
  const start = moment({ year: targetYear, month: targetMonth - 1, day: 1 }).startOf('day')
  const end = start.clone().endOf('month').endOf('day')
  const now = moment()
  const isCurrent = now.year() === targetYear && now.month() === (targetMonth - 1)

  const filtered = transactions.filter(tx => {
    const d = moment(tx.date)
    if (isCurrent) {
      return d.isBetween(start, now, undefined, '[]')
    } else if (d.isBefore(start)) {
      return false
    } else if (d.isAfter(end)) {
      return false
    } else {
      return true
    }
  })

  let income = 0
  let expense = 0
  for (const tx of filtered) {
    if (tx.transaction_type === 'income') income += tx.amount
    if (tx.transaction_type === 'expense') expense += tx.amount
  }
  return { income, expense, result: income - expense }
}

export function committedLimitForCard(transactions: Transaction[], cardClosingDay: number, targetMonth: number, targetYear: number) {
  let committed = 0
  for (const tx of transactions) {
    const { invoiceMonth, invoiceYear } = invoiceMonthForTransaction(tx.date, cardClosingDay)
    if (invoiceMonth === targetMonth && invoiceYear === targetYear) {
      if (tx.transaction_type === 'expense') {
        committed += tx.amount
      }
    }
  }
  return committed
}

export function gaugeColor(valuePct: number, warningPct = 60, criticalPct = 80) {
  if (valuePct >= criticalPct) return 'red'
  if (valuePct >= warningPct) return 'amber'
  return 'green'
}
