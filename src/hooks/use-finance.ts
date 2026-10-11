import * as React from "react"
import { toast } from "sonner"
import type {
  FinanceState,
  Expense,
  Income,
  SavingsGoal,
} from "@/lib/types"
import {
  createDefaultState,
  generateId,
  getBalance,
} from "@/lib/finance"

const STORAGE_KEY = "genz-finance-simulator-v1"

function loadState(): FinanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultState()
    const parsed = JSON.parse(raw) as FinanceState
    return {
      ...createDefaultState(),
      ...parsed,
    }
  } catch {
    return createDefaultState()
  }
}

function saveState(state: FinanceState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore quota errors
  }
}

export function useFinance() {
  const [state, setState] = React.useState<FinanceState>(loadState)

  React.useEffect(() => {
    saveState(state)
  }, [state])

  const addExpense = React.useCallback(
    (expense: Omit<Expense, "id">) => {
      const newExpense: Expense = { ...expense, id: generateId() }
      setState((prev) => ({
        ...prev,
        expenses: [...prev.expenses, newExpense],
      }))

      if (newExpense.isUnexpected) {
        toast.error(`Unexpected expense: ${newExpense.label}`, {
          description: "This will heavily impact your risk score!",
        })
      } else {
        toast.success(`Logged: ${newExpense.label}`)
      }

      const newBalance = getBalance({
        ...state,
        expenses: [...state.expenses, newExpense],
      })
      if (newBalance < 0) {
        toast.warning("You're now in deficit!", {
          description: "Consider cutting back on spending.",
        })
      }
    },
    [state]
  )

  const removeExpense = React.useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }))
    toast.info("Expense removed")
  }, [])

  const addIncome = React.useCallback((income: Omit<Income, "id">) => {
    const newIncome: Income = { ...income, id: generateId() }
    setState((prev) => ({
      ...prev,
      incomes: [...prev.incomes, newIncome],
    }))
    toast.success(`Side income added: ${income.label}`)
  }, [])

  const removeIncome = React.useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      incomes: prev.incomes.filter((i) => i.id !== id),
    }))
    toast.info("Income removed")
  }, [])

  const addSavingsGoal = React.useCallback(
    (goal: Omit<SavingsGoal, "id">) => {
      const newGoal: SavingsGoal = { ...goal, id: generateId() }
      setState((prev) => ({
        ...prev,
        savingsGoals: [...prev.savingsGoals, newGoal],
      }))
      toast.success(`Savings goal created: ${goal.label}`)
    },
    []
  )

  const updateSavingsGoal = React.useCallback(
    (id: string, updates: Partial<SavingsGoal>) => {
      setState((prev) => ({
        ...prev,
        savingsGoals: prev.savingsGoals.map((g) =>
          g.id === id ? { ...g, ...updates } : g
        ),
      }))
    },
    []
  )

  const removeSavingsGoal = React.useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((g) => g.id !== id),
    }))
    toast.info("Savings goal removed")
  }, [])

  const contributeToGoal = React.useCallback(
    (id: string, amount: number) => {
      setState((prev) => {
        const goals = prev.savingsGoals.map((g) => {
          if (g.id !== id) return g
          const newSaved = Math.min(g.savedAmount + amount, g.targetAmount)
          return { ...g, savedAmount: newSaved }
        })
        return { ...prev, savingsGoals: goals }
      })

      const goal = state.savingsGoals.find((g) => g.id === id)
      if (goal) {
        const newSaved = goal.savedAmount + amount
        if (newSaved >= goal.targetAmount) {
          toast.success(`Goal reached: ${goal.label}! 🎉`)
        } else {
          toast.success(`Saved ${amount.toLocaleString("en-IN")} toward ${goal.label}`)
        }
      }
    },
    [state.savingsGoals]
  )

  const setCurrentDay = React.useCallback((day: number) => {
    setState((prev) => ({
      ...prev,
      currentDay: Math.max(1, Math.min(prev.totalDays, day)),
    }))
  }, [])

  const resetPeriod = React.useCallback(() => {
    setState((prev) => ({
      ...createDefaultState(),
      savingsGoals: prev.savingsGoals.map((g) => ({ ...g, savedAmount: 0 })),
    }))
    toast.success("30-day period reset!", {
      description: "Fresh start. Make it count.",
    })
  }, [])

  const hardReset = React.useCallback(() => {
    setState(createDefaultState())
    toast.success("All data cleared!")
  }, [])

  return {
    state,
    addExpense,
    removeExpense,
    addIncome,
    removeIncome,
    addSavingsGoal,
    updateSavingsGoal,
    removeSavingsGoal,
    contributeToGoal,
    setCurrentDay,
    resetPeriod,
    hardReset,
  }
}
