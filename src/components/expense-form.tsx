import * as React from "react"
import { Plus, Trash2, Repeat, Zap, DollarSign } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { FinanceState, ExpenseCategory, ExpenseType } from "@/lib/types"
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/types"
import { formatINR, getBalance } from "@/lib/finance"

export interface ExpenseFormProps {
  state: FinanceState
  onAddExpense: (expense: {
    amount: number
    category: ExpenseCategory
    label: string
    day: number
    type: ExpenseType
    isUnexpected: boolean
  }) => void
  onAddIncome: (income: { amount: number; label: string; day: number }) => void
  onRemoveIncome: (id: string) => void
  onRemoveExpense: (id: string) => void
}

export function ExpenseForm({
  state,
  onAddExpense,
  onAddIncome,
  onRemoveIncome,
  onRemoveExpense,
}: ExpenseFormProps) {
  const [amount, setAmount] = React.useState("")
  const [label, setLabel] = React.useState("")
  const [category, setCategory] = React.useState<ExpenseCategory>("food")
  const [day, setDay] = React.useState(String(state.currentDay))
  const [isRecurring, setIsRecurring] = React.useState(false)
  const [isUnexpected, setIsUnexpected] = React.useState(false)
  const [error, setError] = React.useState("")

  const [incomeAmount, setIncomeAmount] = React.useState("")
  const [incomeLabel, setIncomeLabel] = React.useState("")
  const [incomeDay, setIncomeDay] = React.useState(String(state.currentDay))

  const balance = getBalance(state)

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = Number(amount)

    if (!parsedAmount || parsedAmount <= 0) {
      setError("Enter a valid amount greater than 0")
      return
    }
    if (!label.trim()) {
      setError("Give this expense a label")
      return
    }

    onAddExpense({
      amount: parsedAmount,
      category,
      label: label.trim(),
      day: Number(day),
      type: isRecurring ? "recurring" : "one-time",
      isUnexpected,
    })

    setAmount("")
    setLabel("")
    setCategory("food")
    setIsRecurring(false)
    setIsUnexpected(false)
    setError("")
  }

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = Number(incomeAmount)

    if (!parsedAmount || parsedAmount <= 0) return
    if (!incomeLabel.trim()) return

    onAddIncome({
      amount: parsedAmount,
      label: incomeLabel.trim(),
      day: Number(incomeDay),
    })

    setIncomeAmount("")
    setIncomeLabel("")
  }

  return (
    <div className="space-y-6">
      {/* Expense Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
          <CardDescription>
            Log a new expense. Current balance: {formatINR(balance)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Hold up</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleExpenseSubmit} className="space-y-4" aria-label="Add expense form">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount (₹)</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 250"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  aria-label="Expense amount in rupees"
                  aria-invalid={!!error}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense-label">Label</Label>
                <Input
                  id="expense-label"
                  type="text"
                  placeholder="e.g. Zomato order"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  aria-label="Expense label"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as ExpenseCategory)}
                >
                  <SelectTrigger id="expense-category" aria-label="Expense category">
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

              <div className="space-y-2">
                <Label htmlFor="expense-day">Day (1-30)</Label>
                <Input
                  id="expense-day"
                  type="number"
                  min={1}
                  max={state.totalDays}
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  aria-label="Day of expense"
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" className="w-full" aria-label="Add expense">
                  <Plus className="size-4" />
                  Add Expense
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  id="expense-recurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                  aria-label="Mark as recurring expense"
                />
                <Label htmlFor="expense-recurring" className="flex items-center gap-2">
                  <Repeat className="size-4 text-muted-foreground" />
                  Recurring (subscription / monthly)
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="expense-unexpected"
                  checked={isUnexpected}
                  onCheckedChange={setIsUnexpected}
                  aria-label="Mark as unexpected expense"
                />
                <Label htmlFor="expense-unexpected" className="flex items-center gap-2">
                  <Zap className="size-4 text-amber-500" />
                  Unexpected (heavy risk penalty)
                </Label>
              </div>
            </div>

            {isUnexpected && (
              <Alert className="border-amber-500/40 bg-amber-500/10">
                <Zap className="size-4 text-amber-600" />
                <AlertTitle>Unexpected expense warning</AlertTitle>
                <AlertDescription>
                  Unexpected expenses heavily penalize your risk score and trigger
                  an immediate visual alert. Only use this for genuine surprises
                  like repairs, medical bills, or fines.
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Side Income Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Side Income</CardTitle>
          <CardDescription>
            Got freelance money or pocket money? Log it here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleIncomeSubmit} className="space-y-4" aria-label="Add side income form">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="income-amount">Amount (₹)</Label>
                <Input
                  id="income-amount"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 2000"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  aria-label="Income amount in rupees"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-label">Label</Label>
                <Input
                  id="income-label"
                  type="text"
                  placeholder="e.g. Freelance gig"
                  value={incomeLabel}
                  onChange={(e) => setIncomeLabel(e.target.value)}
                  aria-label="Income label"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income-day">Day</Label>
                <Input
                  id="income-day"
                  type="number"
                  min={1}
                  max={state.totalDays}
                  value={incomeDay}
                  onChange={(e) => setIncomeDay(e.target.value)}
                  aria-label="Day of income"
                />
              </div>
            </div>
            <Button type="submit" variant="secondary" aria-label="Add side income">
              <DollarSign className="size-4" />
              Add Income
            </Button>
          </form>

          {state.incomes.length > 0 && (
            <div className="mt-4 space-y-2">
              <Separator className="mb-3" />
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Logged Income
              </p>
              {state.incomes.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{inc.label}</span>
                    <Badge variant="outline" className="text-xs">
                      Day {inc.day}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatINR(inc.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemoveIncome(inc.id)}
                      aria-label={`Remove income ${inc.label}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All expenses list */}
      {state.expenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>
              {state.expenses.length} transactions this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2" role="list">
              {state.expenses
                .sort((a, b) => b.day - a.day)
                .map((expense) => (
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
                            <span className="text-xs text-muted-foreground">
                              Day {expense.day}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-destructive tabular-nums">
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
