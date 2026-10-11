import type {
  FinanceState,
  RiskAssessment,
  RiskLevel,
  SimulationResult,
  Expense,
} from "./types"

export const STARTING_BUDGET = 10000
export const TOTAL_DAYS = 30

export function formatINR(amount: number): string {
  const sign = amount < 0 ? "-" : ""
  const abs = Math.abs(amount)
  return `${sign}₹${abs.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

export function getTotalIncome(state: FinanceState): number {
  return state.baseBudget + state.incomes.reduce((sum, i) => sum + i.amount, 0)
}

export function getTotalExpenses(state: FinanceState): number {
  return state.expenses.reduce((sum, e) => sum + e.amount, 0)
}

export function getBalance(state: FinanceState): number {
  return getTotalIncome(state) - getTotalExpenses(state)
}

export function getExpensesUpToDay(state: FinanceState, day: number): number {
  return state.expenses
    .filter((e) => e.day <= day)
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getIncomeUpToDay(state: FinanceState, day: number): number {
  const base = state.baseBudget
  const side = state.incomes
    .filter((i) => i.day <= day)
    .reduce((sum, i) => sum + i.amount, 0)
  return base + side
}

export function getBalanceAtDay(state: FinanceState, day: number): number {
  return getIncomeUpToDay(state, day) - getExpensesUpToDay(state, day)
}

export function getDailyAllowance(state: FinanceState): number {
  const balance = getBalance(state)
  const remainingDays = state.totalDays - state.currentDay + 1
  return remainingDays > 0 ? balance / remainingDays : 0
}

export function getDaysUntilBroke(state: FinanceState): number {
  const balance = getBalance(state)
  const dailyAllowance = getDailyAllowance(state)
  if (balance <= 0) return 0
  if (dailyAllowance <= 0) return 0
  return Math.floor(balance / dailyAllowance)
}

export function getTotalSubscriptions(state: FinanceState): number {
  return state.expenses
    .filter((e) => e.type === "recurring" || e.category === "subscriptions")
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getTotalUnexpected(state: FinanceState): number {
  return state.expenses
    .filter((e) => e.isUnexpected)
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getTotalSavings(state: FinanceState): number {
  return state.savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0)
}

export function getSavingsProgress(
  state: FinanceState
): { total: number; target: number; percent: number } {
  const total = getTotalSavings(state)
  const target = state.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0)
  const percent = target > 0 ? (total / target) * 100 : 0
  return { total, target, percent }
}

export function getExpensesByCategory(
  state: FinanceState
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const expense of state.expenses) {
    result[expense.category] = (result[expense.category] ?? 0) + expense.amount
  }
  return result
}

export function getDailySpending(
  state: FinanceState
): { day: number; amount: number }[] {
  const result: { day: number; amount: number }[] = []
  for (let day = 1; day <= state.totalDays; day++) {
    const amount = state.expenses
      .filter((e) => e.day === day)
      .reduce((sum, e) => sum + e.amount, 0)
    result.push({ day, amount })
  }
  return result
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "safe"
  if (score >= 55) return "cautious"
  if (score >= 35) return "warning"
  if (score >= 15) return "danger"
  return "critical"
}

export function assessRisk(
  state: FinanceState,
  balanceOverride?: number,
  extraUnexpected?: number
): RiskAssessment {
  const balance = balanceOverride ?? getBalance(state)
  const totalIncome = getTotalIncome(state)
  const remainingDays = state.totalDays - state.currentDay + 1
  const dailyAllowance = remainingDays > 0 ? balance / remainingDays : 0

  const unexpectedTotal = getTotalUnexpected(state) + (extraUnexpected ?? 0)
  const unexpectedPenalty = Math.min(unexpectedTotal / totalIncome, 0.5) * 100

  const balanceRatio = balance / totalIncome
  const balanceScore = Math.max(0, Math.min(100, balanceRatio * 100))

  const daysUntilBroke =
    dailyAllowance > 0 ? Math.floor(balance / dailyAllowance) : 0
  const daysScore = Math.min(100, (daysUntilBroke / remainingDays) * 100)

  const score = Math.max(
    0,
    Math.min(
      100,
      balanceScore * 0.4 + daysScore * 0.3 - unexpectedPenalty * 0.3 + 10
    )
  )

  const level = getRiskLevel(score)

  return {
    level,
    score: Math.round(score),
    message: "",
    daysUntilBroke,
    projectedBalance: balance,
    dailyAllowance: Math.round(dailyAllowance),
    unexpectedPenalty: Math.round(unexpectedPenalty),
  }
}

export function simulateExpense(
  state: FinanceState,
  expense: { amount: number; category: string; isUnexpected: boolean }
): SimulationResult {
  const currentBalance = getBalance(state)
  const projectedBalance = currentBalance - expense.amount

  const remainingDays = state.totalDays - state.currentDay + 1
  const currentDailyAllowance =
    remainingDays > 0 ? currentBalance / remainingDays : 0
  const projectedDailyAllowance =
    remainingDays > 0 ? projectedBalance / remainingDays : 0

  const currentDaysUntilBroke =
    currentDailyAllowance > 0
      ? Math.floor(currentBalance / currentDailyAllowance)
      : 0
  const projectedDaysUntilBroke =
    projectedDailyAllowance > 0
      ? Math.floor(projectedBalance / projectedDailyAllowance)
      : 0

  const currentRisk = assessRisk(state)
  const extraUnexpected = expense.isUnexpected ? expense.amount : 0
  const projectedRisk = assessRisk(state, projectedBalance, extraUnexpected)

  const savingsImpact = expense.amount * 0.3

  return {
    currentBalance: Math.round(currentBalance),
    projectedBalance: Math.round(projectedBalance),
    currentDailyAllowance: Math.round(currentDailyAllowance),
    projectedDailyAllowance: Math.round(projectedDailyAllowance),
    currentDaysUntilBroke,
    projectedDaysUntilBroke,
    currentRiskScore: currentRisk.score,
    projectedRiskScore: projectedRisk.score,
    currentRiskLevel: currentRisk.level,
    projectedRiskLevel: projectedRisk.level,
    savingsImpact: Math.round(savingsImpact),
    healthDelta: projectedRisk.score - currentRisk.score,
  }
}

export function createDefaultState(): FinanceState {
  return {
    baseBudget: STARTING_BUDGET,
    currentDay: 1,
    totalDays: TOTAL_DAYS,
    incomes: [],
    expenses: [],
    savingsGoals: [],
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function sortExpensesByDay(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => b.day - a.day)
}
