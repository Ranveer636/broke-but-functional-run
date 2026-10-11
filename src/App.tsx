import { LayoutDashboard, PlusCircle, Activity, Target, Wallet, RotateCcw } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import { ModeToggle } from "@/components/mode-toggle"
import { Dashboard } from "@/components/dashboard"
import { ExpenseForm } from "@/components/expense-form"
import { SimulationEngine } from "@/components/simulation-engine"
import { GoalsView } from "@/components/goals-view"
import { useFinance } from "@/hooks/use-finance"
import { formatINR, getBalance, getTotalIncome, getTotalExpenses } from "@/lib/finance"

export function App() {
  const finance = useFinance()
  const { state } = finance

  const balance = getBalance(state)
  const totalIncome = getTotalIncome(state)
  const totalExpenses = getTotalExpenses(state)

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm"
        role="banner"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span
              className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <Wallet className="size-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">
                BudgetBuddy
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                30-day finance simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={balance < 0 ? "destructive" : "secondary"}
              className="hidden tabular-nums sm:inline-flex"
              aria-label={`Current balance: ${formatINR(balance)}`}
            >
              {formatINR(balance)}
            </Badge>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-6" role="main">
        {/* Summary bar */}
        <section
          className="mb-6 grid grid-cols-3 gap-3"
          aria-label="Financial summary"
        >
          <div className="rounded-lg border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="mt-1 text-sm font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
              {formatINR(totalIncome)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="mt-1 text-sm font-bold text-destructive tabular-nums">
              {formatINR(totalExpenses)}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p
              className={cn(
                "mt-1 text-sm font-bold tabular-nums",
                balance < 0 ? "text-destructive" : "text-foreground"
              )}
            >
              {formatINR(balance)}
            </p>
          </div>
        </section>

        {/* Day indicator */}
        <section
          className="mb-6 flex items-center justify-center"
          aria-label="Current day in 30-day period"
        >
          <Badge variant="outline" className="gap-2 px-4 py-1.5 text-sm">
            <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
            Day {state.currentDay} of {state.totalDays}
          </Badge>
        </section>

        {/* Tabbed navigation */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList
            className="grid w-full grid-cols-4"
            role="tablist"
            aria-label="Main navigation"
          >
            <TabsTrigger value="dashboard" aria-label="View dashboard">
              <LayoutDashboard className="size-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="expense" aria-label="Add expense">
              <PlusCircle className="size-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </TabsTrigger>
            <TabsTrigger value="simulate" aria-label="Run simulation">
              <Activity className="size-4" />
              <span className="hidden sm:inline">Simulate</span>
            </TabsTrigger>
            <TabsTrigger value="goals" aria-label="View savings goals">
              <Target className="size-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <Dashboard
              state={state}
              onRemoveExpense={finance.removeExpense}
              onResetPeriod={finance.resetPeriod}
              onJumpDay={finance.setCurrentDay}
            />
          </TabsContent>

          <TabsContent value="expense" className="mt-6">
            <ExpenseForm
              state={state}
              onAddExpense={finance.addExpense}
              onAddIncome={finance.addIncome}
              onRemoveIncome={finance.removeIncome}
              onRemoveExpense={finance.removeExpense}
            />
          </TabsContent>

          <TabsContent value="simulate" className="mt-6">
            <SimulationEngine
              state={state}
              onConfirm={finance.addExpense}
            />
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <GoalsView
              state={state}
              onAddGoal={finance.addSavingsGoal}
              onContribute={finance.contributeToGoal}
              onRemoveGoal={finance.removeSavingsGoal}
            />
          </TabsContent>
        </Tabs>

        {/* Full reset button */}
        <section className="mt-8 flex justify-center" aria-label="Danger zone">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              if (confirm("Clear ALL data and start fresh? This cannot be undone.")) {
                finance.hardReset()
              }
            }}
            aria-label="Clear all data and reset"
          >
            <RotateCcw className="size-3.5" />
            Clear all data
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-4" role="contentinfo">
        <p className="text-center text-xs text-muted-foreground">
          BudgetBuddy — your 30-day money simulator. Data saved locally on your device.
        </p>
      </footer>

      {/* Toast notifications */}
      <Toaster position="top-center" />
    </div>
  )
}

export default App
