import * as React from "react"
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Target,
  CalendarDays,
  Trash2,
  Repeat,
  Zap,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  Pie,
  PieChart,
} from "recharts"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { RiskIndicator } from "@/components/risk-indicator"
import type { FinanceState, Expense } from "@/lib/types"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types"
import {
  formatINR,
  getTotalIncome,
  getTotalExpenses,
  getBalance,
  getDailyAllowance,
  getTotalSubscriptions,
  getTotalUnexpected,
  getSavingsProgress,
  getExpensesByCategory,
  getDailySpending,
  sortExpensesByDay,
} from "@/lib/finance"

export interface DashboardProps {
  state: FinanceState
  onRemoveExpense: (id: string) => void
  onResetPeriod: () => void
  onJumpDay: (day: number) => void
}

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#888",
  "#aaa",
  "#ccc",
  "#ddd",
]

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  sublabel?: string
  tone?: "default" | "positive" | "negative" | "warning"
}) {
  const toneClass =
    tone === "negative"
      ? "text-destructive"
      : tone === "positive"
        ? "text-emerald-600 dark:text-emerald-400"
        : tone === "warning"
          ? "text-amber-600 dark:text-amber-400"
          : "text-foreground"

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" />
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <p className={cn("mt-2 text-2xl font-bold tabular-nums", toneClass)}>
          {value}
        </p>
        {sublabel && (
          <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function Dashboard({
  state,
  onRemoveExpense,
  onResetPeriod,
  onJumpDay,
}: DashboardProps) {
  const totalIncome = getTotalIncome(state)
  const totalExpenses = getTotalExpenses(state)
  const balance = getBalance(state)
  const dailyAllowance = getDailyAllowance(state)
  const subscriptionsTotal = getTotalSubscriptions(state)
  const unexpectedTotal = getTotalUnexpected(state)
  const savings = getSavingsProgress(state)
  const categoryData = getExpensesByCategory(state)
  const dailyData = getDailySpending(state)
  const sortedExpenses = sortExpensesByDay(state.expenses)

  const pieData = Object.entries(categoryData).map(([key, value]) => ({
    name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] ?? key,
    value,
    key,
  }))

  const pieConfig = {
    expenses: { label: "Expenses" },
  } satisfies ChartConfig

  const dailyConfig = {
    amount: { label: "Spending", color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <div className="space-y-6">
      {/* Day control bar */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Current Day</p>
              <p className="text-lg font-bold">
                Day {state.currentDay} of {state.totalDays}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="day-jump" className="text-sm text-muted-foreground">
              Jump to day:
            </label>
            <input
              id="day-jump"
              type="range"
              min={1}
              max={state.totalDays}
              value={state.currentDay}
              onChange={(e) => onJumpDay(Number(e.target.value))}
              className="w-32 accent-primary"
              aria-label="Jump to day"
            />
            <span className="w-8 text-sm font-semibold tabular-nums">
              {state.currentDay}
            </span>
            <Button variant="outline" size="sm" onClick={onResetPeriod}>
              <Trash2 className="size-4" />
              Reset Period
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk indicator */}
      <RiskIndicator state={state} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Total Income"
          value={formatINR(totalIncome)}
          sublabel={`Base: ${formatINR(state.baseBudget)}`}
          tone="positive"
        />
        <StatCard
          icon={Wallet}
          label="Balance"
          value={formatINR(balance)}
          sublabel={`${formatINR(dailyAllowance)}/day left`}
          tone={balance < 0 ? "negative" : "default"}
        />
        <StatCard
          icon={TrendingDown}
          label="Total Spent"
          value={formatINR(totalExpenses)}
          sublabel={`${state.expenses.length} transactions`}
          tone="negative"
        />
        <StatCard
          icon={Target}
          label="Savings"
          value={formatINR(savings.total)}
          sublabel={`${Math.round(savings.percent)}% of goal`}
          tone={savings.percent >= 100 ? "positive" : "default"}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          icon={Repeat}
          label="Subscriptions"
          value={formatINR(subscriptionsTotal)}
          sublabel="Monthly recurring"
          tone="warning"
        />
        <StatCard
          icon={Zap}
          label="Unexpected"
          value={formatINR(unexpectedTotal)}
          sublabel="Risk penalty active"
          tone={unexpectedTotal > 0 ? "negative" : "default"}
        />
        <StatCard
          icon={CalendarDays}
          label="Days Left"
          value={`${state.totalDays - state.currentDay + 1}`}
          sublabel="Including today"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Where your money went this period</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                No expenses logged yet
              </div>
            ) : (
              <ChartContainer config={pieConfig} className="min-h-[220px] w-full">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            )}
            {pieData.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {pieData.map((entry, index) => (
                  <Badge key={entry.key} variant="secondary" className="gap-1.5">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      aria-hidden="true"
                    />
                    {entry.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Spending</CardTitle>
            <CardDescription>Day-by-day expense breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dailyConfig} className="min-h-[220px] w-full">
              <BarChart data={dailyData} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `D${v}`}
                  interval={4}
                />
                <YAxis tickLine={false} axisLine={false} width={48} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Savings progress */}
      {state.savingsGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Progress toward your targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.savingsGoals.map((goal) => {
              const percent = goal.targetAmount > 0
                ? (goal.savedAmount / goal.targetAmount) * 100
                : 0
              return (
                <div key={goal.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{goal.label}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatINR(goal.savedAmount)} / {formatINR(goal.targetAmount)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, percent)}
                    className="mt-2 h-2"
                    aria-label={`${goal.label} progress: ${Math.round(percent)} percent`}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest spending activity</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedExpenses.length === 0 ? (
            <div className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
              No transactions yet. Add an expense to get started!
            </div>
          ) : (
            <ul className="space-y-2" role="list">
              {sortedExpenses.slice(0, 8).map((expense: Expense) => (
                <li key={expense.id}>
                  <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">
                        {CATEGORY_ICONS[expense.category]}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{expense.label}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[expense.category]}
                          </Badge>
                          {expense.isUnexpected && (
                            <Badge variant="destructive" className="text-xs">
                              Unexpected
                            </Badge>
                          )}
                          {expense.type === "recurring" && (
                            <Badge variant="secondary" className="text-xs">
                              <Repeat className="size-3" />
                              Recurring
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Day {expense.day}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          "text-destructive"
                        )}
                      >
                        -{formatINR(expense.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onRemoveExpense(expense.id)}
                        aria-label={`Remove expense ${expense.label}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {sortedExpenses.length > 8 && (
            <>
              <Separator className="my-3" />
              <p className="text-center text-xs text-muted-foreground">
                Showing 8 of {sortedExpenses.length} transactions
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
