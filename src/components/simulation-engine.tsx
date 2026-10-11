import * as React from "react"
import {
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Check,
  X,
  Activity,
  AlertTriangle,
  CalendarClock,
  Wallet,
  Target,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RiskIndicator } from "@/components/risk-indicator"
import type { FinanceState, ExpenseCategory, SimulationResult } from "@/lib/types"
import { CATEGORY_LABELS, CATEGORY_ICONS, RISK_LABELS } from "@/lib/types"
import { simulateExpense, formatINR } from "@/lib/finance"

export interface SimulationEngineProps {
  state: FinanceState
  onConfirm: (expense: {
    amount: number
    category: ExpenseCategory
    label: string
    day: number
    type: "one-time" | "recurring"
    isUnexpected: boolean
  }) => void
}

function MetricRow({
  icon: Icon,
  label,
  current,
  projected,
  isCurrency = true,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  current: number
  projected: number
  isCurrency?: boolean
}) {
  const delta = projected - current
  const isNegative = delta < 0

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2.5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tabular-nums">
          {isCurrency ? formatINR(current) : current}
        </span>
        <ArrowRight className="size-3 text-muted-foreground" />
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            isNegative ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
          )}
        >
          {isCurrency ? formatINR(projected) : projected}
        </span>
      </div>
    </div>
  )
}

export function SimulationEngine({ state, onConfirm }: SimulationEngineProps) {
  const [amount, setAmount] = React.useState("")
  const [label, setLabel] = React.useState("")
  const [category, setCategory] = React.useState<ExpenseCategory>("entertainment")
  const [isUnexpected, setIsUnexpected] = React.useState(false)
  const [hasSimulated, setHasSimulated] = React.useState(false)

  const parsedAmount = Number(amount) || 0
  const hasValidInput = parsedAmount > 0 && label.trim().length > 0

  const simulation: SimulationResult | null = React.useMemo(() => {
    if (!hasValidInput) return null
    return simulateExpense(state, {
      amount: parsedAmount,
      category,
      isUnexpected,
    })
  }, [state, parsedAmount, category, isUnexpected, hasValidInput])

  React.useEffect(() => {
    if (hasValidInput) {
      setHasSimulated(true)
    } else {
      setHasSimulated(false)
    }
  }, [hasValidInput])

  const handleConfirm = () => {
    if (!hasValidInput) return
    onConfirm({
      amount: parsedAmount,
      category,
      label: label.trim(),
      day: state.currentDay,
      type: "one-time",
      isUnexpected,
    })
    setAmount("")
    setLabel("")
    setCategory("entertainment")
    setIsUnexpected(false)
    setHasSimulated(false)
  }

  const handleCancel = () => {
    setAmount("")
    setLabel("")
    setCategory("entertainment")
    setIsUnexpected(false)
    setHasSimulated(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Simulation Engine
          </CardTitle>
          <CardDescription>
            See the future impact of your spending before you commit. Enter an
            expense and watch your projected financial health update in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (hasValidInput) handleConfirm()
            }}
            className="space-y-4"
            aria-label="Simulation engine form"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sim-amount">Amount (₹)</Label>
                <Input
                  id="sim-amount"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-label="Simulation amount in rupees"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sim-label">What is it for?</Label>
                <Input
                  id="sim-label"
                  type="text"
                  placeholder="e.g. New sneakers"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  aria-label="Simulation expense label"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sim-category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as ExpenseCategory)}
                >
                  <SelectTrigger id="sim-category" aria-label="Simulation category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-3">
                <Switch
                  id="sim-unexpected"
                  checked={isUnexpected}
                  onCheckedChange={setIsUnexpected}
                  aria-label="Mark as unexpected expense in simulation"
                />
                <Label htmlFor="sim-unexpected" className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="size-4 text-amber-500" />
                  Unexpected expense
                </Label>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {simulation && hasSimulated ? (
        <div className="space-y-6">
          {/* Health score comparison */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="size-5" />
                Health Impact Preview
              </CardTitle>
              <CardDescription>
                How this expense changes your financial health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Current Score
                  </p>
                  <p className="mt-2 text-4xl font-bold tabular-nums">
                    {simulation.currentRiskScore}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {RISK_LABELS[simulation.currentRiskLevel]}
                  </Badge>
                </div>
                <div
                  className={cn(
                    "rounded-lg border-2 p-4 text-center transition-all duration-500",
                    simulation.healthDelta < -10
                      ? "border-red-500/50 bg-red-500/5"
                      : simulation.healthDelta < 0
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-emerald-500/50 bg-emerald-500/5"
                  )}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Projected Score
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-4xl font-bold tabular-nums transition-colors duration-500",
                      simulation.healthDelta < -10
                        ? "text-red-600 dark:text-red-400"
                        : simulation.healthDelta < 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {simulation.projectedRiskScore}
                  </p>
                  <Badge
                    variant={
                      simulation.projectedRiskLevel === "danger" ||
                      simulation.projectedRiskLevel === "critical"
                        ? "destructive"
                        : "secondary"
                    }
                    className="mt-2"
                  >
                    {RISK_LABELS[simulation.projectedRiskLevel]}
                  </Badge>
                </div>
              </div>

              {/* Delta indicator */}
              <div className="flex items-center justify-center gap-2">
                {simulation.healthDelta < 0 ? (
                  <TrendingDown className="size-5 text-destructive" />
                ) : (
                  <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span
                  className={cn(
                    "text-lg font-bold tabular-nums",
                    simulation.healthDelta < 0
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                  aria-live="polite"
                  role="status"
                >
                  {simulation.healthDelta > 0 ? "+" : ""}
                  {simulation.healthDelta} points
                </span>
                <span className="text-sm text-muted-foreground">change</span>
              </div>

              {simulation.healthDelta < -20 && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertTitle>Major impact detected</AlertTitle>
                  <AlertDescription>
                    This expense would drop your financial health by{" "}
                    {Math.abs(simulation.healthDelta)} points. Consider whether
                    it's worth it or find a cheaper alternative.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Detailed metric comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Projected Metrics</CardTitle>
              <CardDescription>Side-by-side comparison</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <MetricRow
                icon={Wallet}
                label="Balance"
                current={simulation.currentBalance}
                projected={simulation.projectedBalance}
              />
              <MetricRow
                icon={CalendarClock}
                label="Daily Allowance"
                current={simulation.currentDailyAllowance}
                projected={simulation.projectedDailyAllowance}
              />
              <MetricRow
                icon={CalendarClock}
                label="Days Until Broke"
                current={simulation.currentDaysUntilBroke}
                projected={simulation.projectedDaysUntilBroke}
                isCurrency={false}
              />
              <MetricRow
                icon={Target}
                label="Savings Impact"
                current={0}
                projected={simulation.savingsImpact}
              />
            </CardContent>
          </Card>

          {/* Risk indicators side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Current Risk
              </p>
              <RiskIndicator state={state} compact showDetails={false} />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Projected Risk After Expense
              </p>
              <RiskIndicator
                state={state}
                balanceOverride={simulation.projectedBalance}
                extraUnexpected={isUnexpected ? parsedAmount : 0}
                compact
                showDetails={false}
              />
            </div>
          </div>

          {/* Confirm / Cancel */}
          <Separator />
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              aria-label="Cancel and clear simulation"
            >
              <X className="size-4" />
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              aria-label="Confirm and log this expense"
              className="min-w-[200px]"
            >
              <Check className="size-4" />
              Confirm Expense
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Activity className="size-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold">Simulation Ready</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Enter an amount and label above to see exactly how this expense
                will impact your budget, daily allowance, and risk score — before
                you commit.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
