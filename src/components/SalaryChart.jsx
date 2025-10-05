import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function SalaryChart({ data, colors }) {
  // data: [{ year, salary }]
  const chartData = (data || []).map(d => ({ year: d.year, salary: Math.round(d.salary) }))

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.blue} stopOpacity={0.8} />
              <stop offset="95%" stopColor={colors.blue} stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip formatter={v => v.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 })} />
          <Area type="monotone" dataKey="salary" stroke={colors.blue} fill="url(#grad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
