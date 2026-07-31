import React from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { gaugeColor } from '../lib/finance'

type Props = {
  valuePct: number
  size?: number
  warningPct?: number
  criticalPct?: number
  label?: string
}

export default function GaugeChart({ valuePct, size = 160, warningPct = 60, criticalPct = 80, label }: Props) {
  const colorZone = gaugeColor(valuePct, warningPct, criticalPct)
  const fillColor = colorZone === 'green' ? '#10b981' : colorZone === 'amber' ? '#f59e0b' : '#ef4444'
  const data = [
    { name: 'used', value: valuePct },
    { name: 'rest', value: Math.max(0, 100 - valuePct) }
  ]
  return (
    <div className="flex flex-col items-center">
      <PieChart width={size} height={size/2}>
        <Pie
          data={data}
          startAngle={180}
          endAngle={0}
          innerRadius={size * 0.25}
          outerRadius={size * 0.45}
          dataKey="value"
        >
          <Cell key="cell-used" fill={fillColor} />
          <Cell key="cell-rest" fill="#e6e6e6" />
        </Pie>
      </PieChart>
      <div className="mt-2 text-center">
        <div className="text-sm text-zinc-500">{label}</div>
        <div className="text-lg font-semibold" style={{ color: fillColor }}>{valuePct.toFixed(0)}%</div>
      </div>
    </div>
  )
}
