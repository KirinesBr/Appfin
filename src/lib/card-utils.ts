import moment from 'moment'
import { Transaction } from '@prisma/client'

export function transactionsForCardInvoice(allTransactions: Transaction[], closingDay: number, targetMonth: number, targetYear: number) {
  return allTransactions.filter(tx => {
    const d = moment(tx.date)
    const lastDay = d.clone().endOf('month').date()
    const normalizedClosing = Math.min(closingDay, lastDay)
    let invoiceMonth: number
    let invoiceYear: number
    if (d.date() > normalizedClosing) {
      const m = d.clone().add(1, 'month')
      invoiceMonth = m.month() + 1
      invoiceYear = m.year()
    } else {
      invoiceMonth = d.month() + 1
      invoiceYear = d.year()
    }
    return invoiceMonth === targetMonth && invoiceYear === targetYear
  })
}
