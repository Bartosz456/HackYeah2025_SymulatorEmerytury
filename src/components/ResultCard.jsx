import React from 'react'

function formatCurrency(x) {
  return x.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 })
}

export default function ResultCard({ estimate, params, colors }) {
  // Bezpiecznie destrukturyzujemy z fallbackami
  const {
    monthlyNominal = 0,
    monthlyReal = 0,
    replacementRate = 0,
    accumulated = 0,
    yearsToMeetExpectation = 0
  } = estimate || {}

  return (
    <div className="card result-card">
      <h2>Wynik</h2>

      <div className="grid">
        <div className="stat">
          <div className="label">Miesięcznie (nominalnie)</div>
          <div className="value">{formatCurrency(Math.round(monthlyNominal))}</div>
        </div>

        <div className="stat">
          <div className="label">Miesięcznie (urealnione)</div>
          <div className="value">{formatCurrency(Math.round(monthlyReal))}</div>
        </div>

        <div className="stat">
          <div className="label">Stopa zastąpienia (przybliżona)</div>
          <div className="value">{(replacementRate * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="comparison">
        {monthlyNominal >= params.expectedMonthly ? (
          <div className="ok">Twoja prognozowana emerytura spełnia oczekiwanie.</div>
        ) : (
          <div className="warn">
            Brakuje około <strong>{formatCurrency(Math.round(params.expectedMonthly - monthlyNominal))}</strong>. Aby
            osiągnąć oczekiwaną kwotę, rozważ wydłużenie pracy o ~{yearsToMeetExpectation} lat.
          </div>
        )}
      </div>

      <div className="controls">
        <button
          onClick={() => {
            // CSV download
            const rows = [
              ['Parameter', 'Value'],
              ['Age', params.age],
              ['Sex', params.sex],
              ['Gross monthly', params.gross],
              ['Start year', params.startYear],
              ['Retire year', params.retireYear],
              ['Include sick', params.includeSick],
              ['SavedAccount', params.savedAccount],
              ['Monthly nominal', Math.round(monthlyNominal)],
              ['Monthly real', Math.round(monthlyReal)]
            ]

            const csv = rows
              .map(r =>
                r
                  .map(String)
                  .map(s => '"' + s.replace(/"/g, '""') + '"')
                  .join(',')
              )
              .join('\n')

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `symulator_report_${new Date().toISOString().slice(0, 10)}.csv`
            document.body.appendChild(a)
            a.click()
            a.remove()
            URL.revokeObjectURL(url)
          }}
        >
          Pobierz raport (CSV)
        </button>

        <button onClick={() => alert('PDF nie zaimplementowany w prototypie')}>Pobierz raport (PDF)</button>
      </div>
    </div>
  )
}
