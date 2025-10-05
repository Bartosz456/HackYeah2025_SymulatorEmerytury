// Uproszczone obliczenia — edukacyjny prototyp

const DEFAULT_ANNUAL_WAGE_GROWTH = 1.029 // ~2.9% yearly (simplified)
const CONTRIBUTION_RATE = 0.195 // combined illustrative contribution
const ANNUITY_DIVISOR = 200
const PENSION_REPLACEMENT_FACTOR = 0.60
const INFLATION = 1.025 // 2.5% example

export function projectSalaryPath(initialMonthlyGross, startYear, yearsCount) {
  const out = []
  let salary = initialMonthlyGross

  // if yearsCount is number of years to produce (inclusive), we'll produce yearsCount entries:
  // original logic used <=; keep consistent: produce yearsCount entries starting at startYear
  for (let i = 0; i < yearsCount; i++) {
    const year = startYear + i
    out.push({ year: String(year), salary: Math.round(salary) })
    salary = salary * DEFAULT_ANNUAL_WAGE_GROWTH
  }

  // if yearsCount === 0 produce at least one entry for startYear
  if (out.length === 0) {
    out.push({ year: String(startYear), salary: Math.round(salary) })
  }

  return out
}

export function estimatePension({ params, salaryPath }) {
  // Compute accumulated contributions (very simplified): sum of monthly gross * 12 * contribution rate
  const totalContrib = (salaryPath || []).reduce((s, p) => s + (p.salary * 12 * CONTRIBUTION_RATE), 0)

  // sick-leave penalty
  const sickPenalty = params.includeSick ? (params.sex === 'F' ? 0.97 : 0.98) : 1.0
  const accumulated = totalContrib * sickPenalty + Number(params.savedAccount || 0)

  const annualFromCapital = accumulated / ANNUITY_DIVISOR

  // normative pension: fraction of last gross annual salary
  const lastSalary = (salaryPath && salaryPath.length) ? salaryPath[salaryPath.length - 1].salary : params.gross
  const normativeAnnual = lastSalary * 12 * PENSION_REPLACEMENT_FACTOR

  const annualEstimate = (annualFromCapital + normativeAnnual) / 2
  const monthlyNominal = annualEstimate / 12
  const monthlyReal = monthlyNominal / INFLATION

  const replacementRate = monthlyNominal / lastSalary

  // years to meet expected amount (crude): assume each year delayed increases monthly by 6%
  let yearsToMeet = 0
  if (monthlyNominal < params.expectedMonthly) {
    let val = monthlyNominal
    while (val < params.expectedMonthly && yearsToMeet < 40) {
      val *= 1.06
      yearsToMeet++
    }
  }

  return {
  monthlyNominal,
  monthlyReal,
  realPension: monthlyReal,
  replacementRate,
  accumulated,
  yearsToMeetExpectation: yearsToMeet,
  yearsToMeetExpectationReadable: yearsToMeet
}
}
