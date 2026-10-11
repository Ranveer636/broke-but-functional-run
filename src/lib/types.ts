export type ExpenseCategory =
  | "food"
  | "rent"
  | "transport"
  | "entertainment"
  | "shopping"
  | "subscriptions"
  | "utilities"
  | "unexpected"
  | "other"

export type ExpenseType = "one-time" | "recurring"

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  label: string
  day: number
  type: ExpenseType
  isUnexpected: boolean
}

export interface Income {
  id: string
  amount: number
  label: string
  day: number
}

export interface SavingsGoal {
  id: string
  label: string
  targetAmount: number
  savedAmount: number
  deadlineDay: number
}

export interface FinanceState {
  baseBudget: number
  currentDay: number
  totalDays: number
  incomes: Income[]
  expenses: Expense[]
  savingsGoals: SavingsGoal[]
}

export type RiskLevel = "safe" | "cautious" | "warning" | "danger" | "critical"

export interface RiskAssessment {
  level: RiskLevel
  score: number
  message: string
  daysUntilBroke: number
  projectedBalance: number
  dailyAllowance: number
  unexpectedPenalty: number
}

export interface SimulationResult {
  currentBalance: number
  projectedBalance: number
  currentDailyAllowance: number
  projectedDailyAllowance: number
  currentDaysUntilBroke: number
  projectedDaysUntilBroke: number
  currentRiskScore: number
  projectedRiskScore: number
  currentRiskLevel: RiskLevel
  projectedRiskLevel: RiskLevel
  savingsImpact: number
  healthDelta: number
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: "Food & Dining",
  rent: "Rent & Housing",
  transport: "Transport",
  entertainment: "Entertainment",
  shopping: "Shopping",
  subscriptions: "Subscriptions",
  utilities: "Utilities",
  unexpected: "Unexpected",
  other: "Other",
}

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  food: "🍔",
  rent: "🏠",
  transport: "🚌",
  entertainment: "🎮",
  shopping: "🛍️",
  subscriptions: "📱",
  utilities: "💡",
  unexpected: "⚠️",
  other: "📦",
}

export const RISK_MESSAGES: Record<RiskLevel, string> = {
  safe: "you're eating good this month 💅",
  cautious: "vibes are okay but watch it 👀",
  warning: "bruh maybe slow down on the treats 🫠",
  danger: "the budget is stressin 💀",
  critical: "bro the budget is COOKED 🔥💀",
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  safe: "Safe",
  cautious: "Cautious",
  warning: "Warning",
  danger: "Danger",
  critical: "Critical",
}
