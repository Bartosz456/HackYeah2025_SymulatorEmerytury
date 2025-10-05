import React from 'react'

export default function InputForm({ params, setParams, colors }) {
  const update = (field, value) => setParams(prev => ({ ...prev, [field]: value }))

  return (
    <div className="card">
      <h2>Dane wejściowe</h2>

      <label>
        Wiek
        <input
          type="number"
          min="0"
          value={params.age}
          onChange={e => update('age', Number(e.target.value))}
        />
      </label>

      <label>
        Płeć
        <select value={params.sex} onChange={e => update('sex', e.target.value)}>
          <option value="M">Mężczyzna</option>
          <option value="F">Kobieta</option>
        </select>
      </label>

      <label>
        Wynagrodzenie brutto (miesięcznie)
        <input
          type="number"
          min="0"
          value={params.gross}
          onChange={e => update('gross', Number(e.target.value))}
        />
      </label>

      <label>
        Rok rozpoczęcia pracy (styczeń)
        <input
          type="number"
          value={params.startYear}
          onChange={e => update('startYear', Number(e.target.value))}
        />
      </label>

      <label>
        Planowany rok zakończenia pracy (styczeń)
        <input
          type="number"
          value={params.retireYear}
          onChange={e => update('retireYear', Number(e.target.value))}
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={params.includeSick}
          onChange={e => update('includeSick', e.target.checked)}
        />
        Uwzględniaj zwolnienia lekarskie
      </label>

      <label>
        Środki na koncie / subkoncie (opcjonalne)
        <input
          type="number"
          min="0"
          value={params.savedAccount}
          onChange={e => update('savedAccount', Number(e.target.value))}
        />
      </label>

      <label>
        Oczekiwana miesięczna emerytura (dla porównań)
        <input
          type="number"
          min="0"
          value={params.expectedMonthly}
          onChange={e => update('expectedMonthly', Number(e.target.value))}
        />
      </label>
    </div>
  )
}
