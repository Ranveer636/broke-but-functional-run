import * as React from "react"
import { Plus, Trash2, Target, Trophy, CalendarDays } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import type { FinanceState, SavingsGoal } from "@/lib/types"
import { formatINR, getBalance } from "@/lib/finance"

export interface GoalsViewProps {
  state: FinanceState
  onAddGoal: (goal: {
    label: string
    targetAmount: number
    savedAmount: number
    deadlineDay: number
  }) => void
  onContribute: (id: string, amount: number) => void
  onRemoveGoal: (id: string) => void
}

export function GoalsView({
  state,
  onAddGoal,
  onContribute,
  onRemoveGoal,
}: GoalsViewProps) {
  const [label, setLabel] = React.useState("")
  const [targetAmount, setTargetAmount] = React.useState("")
  const [deadlineDay, setDeadlineDay] = React.useState("30")

  const balance = getBalance(state)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = Number(targetAmount)
    if (!parsed || parsed <= 0) return
    if (!label.trim()) return

    onAddGoal({
      label: label.trim(),
      targetAmount: parsed,
      savedAmount: 0,
      deadlineDay: Math.max(1, Math.min(state.totalDays, Number(deadlineDay) || 30)),
    })

    setLabel("")
    setTargetAmount("")
    setDeadlineDay("30")
  }

  return (
    <div className="space-y-6">
      {/* Create goal form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5" />
            Create Savings Goal
          </CardTitle>
          <CardDescription>
            Set a target and deadline. Build that emergency fund or save for something fun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Create savings goal form">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="goal-label">Goal Name</Label>
                <Input
                  id="goal-label"
                  type="text"
                  placeholder="e.g. Emergency fund"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  aria-label="Savings goal name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-target">Target Amount (₹)</Label>
                <Input
                  id="goal-target"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  aria-label="Savings goal target amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Deadline (Day)</Label>
                <Input
                  id="goal-deadline"
                  type="number"
                  min={1}
                  max={state.totalDays}
                  value={deadlineDay}
                  onChange={(e) => setDeadlineDay(e.target.value)}
                  aria-label="Savings goal deadline day"
                />
              </div>
            </div>
            <Button type="submit" aria-label="Create savings goal">
              <Plus className="size-4" />
              Create Goal
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing goals */}
      {state.savingsGoals.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Target />
            </EmptyMedia>
            <EmptyTitle>No savings goals yet</EmptyTitle>
            <EmptyDescription>
              Create your first goal above to start tracking your savings progress.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {state.savingsGoals.map((goal: SavingsGoal) => {
            const percent =
              goal.targetAmount > 0
                ? (goal.savedAmount / goal.targetAmount) * 100
                : 0
            const isComplete = goal.savedAmount >= goal.targetAmount
            const remaining = Math.max(0, goal.targetAmount - goal.savedAmount)

            return (
              <Card
                key={goal.id}
                className={cn(isComplete && "border-emerald-500/40")}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {isComplete ? (
                        <Trophy className="size-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Target className="size-5 text-muted-foreground" />
                      )}
                      {goal.label}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemoveGoal(goal.id)}
                      aria-label={`Remove goal ${goal.label}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <CalendarDays className="size-3.5" />
                    Deadline: Day {goal.deadlineDay}
                    {isComplete && (
                      <Badge variant="default" className="bg-emerald-600 text-white">
                        Achieved!
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold tabular-nums">
                      {formatINR(goal.savedAmount)}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      of {formatINR(goal.targetAmount)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, percent)}
                    className={cn(
                      "h-3",
                      isComplete && "[&_[data-slot=progress-indicator]]:bg-emerald-500"
                    )}
                    aria-label={`${goal.label} progress: ${Math.round(percent)} percent`}
                  />
                  <p className="text-xs text-muted-foreground">
                    {remaining > 0
                      ? `${formatINR(remaining)} left to go`
                      : "Goal fully funded!"}
                  </p>

                  {!isComplete && (
                    <>
                      <Separator />
                      <ContributeControl
                        goalId={goal.id}
                        balance={balance}
                        onContribute={onContribute}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ContributeControl({
  goalId,
  balance,
  onContribute,
}: {
  goalId: string
  balance: number
  onContribute: (id: string, amount: number) => void
}) {
  const [amount, setAmount] = React.useState("")

  const handleContribute = () => {
    const parsed = Number(amount)
    if (!parsed || parsed <= 0) return
    onContribute(goalId, parsed)
    setAmount("")
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1 space-y-2">
        <Label htmlFor={`contribute-${goalId}`} className="text-xs">
          Add to this goal
        </Label>
        <Input
          id={`contribute-${goalId}`}
          type="number"
          inputMode="numeric"
          placeholder="e.g. 500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="Contribution amount"
        />
      </div>
      <Button
        type="button"
        size="sm"
        onClick={handleContribute}
        disabled={Number(amount) <= 0 || Number(amount) > balance}
        aria-label="Add contribution to this goal"
      >
        <Plus className="size-4" />
        Add
      </Button>
    </div>
  )
}
