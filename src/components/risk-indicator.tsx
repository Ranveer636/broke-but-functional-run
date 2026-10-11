import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { FinanceState, RiskLevel } from "@/lib/types"
import {
  RISK_MESSAGES,
  RISK_LABELS,
} from "@/lib/types"
import {
  assessRisk,
  formatINR,
  getBalance,
  getTotalUnexpected,
  getTotalSubscriptions,
} from "@/lib/finance"

const RISK_COLORS: Record<RiskLevel, string> = {
  safe: "text-emerald-600 dark:text-emerald-400",
  cautious: "text-blue-600 dark:text-blue-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-orange-600 dark:text-orange-400",
  critical: "text-red-600 dark:text-red-400",
}

const RISK_BAR_COLORS: Record<RiskLevel, string> = {
  safe: "[&_[data-slot=progress-indicator]]:bg-emerald-500",
  cautious: "[&_[data-slot=progress-indicator]]:bg-blue-500",
  warning: "[&_[data-slot=progress-indicator]]:bg-amber-500",
  danger: "[&_[data-slot=progress-indicator]]:bg-orange-500",
  critical: "[&_[data-slot=progress-indicator]]:bg-red-500",
}

const RISK_BADGE_VARIANT: Record<
  RiskLevel,
  "default" | "secondary" | "destructive" | "outline"
> = {
  safe: "default",
  cautious: "secondary",
  warning: "outline",
  danger: "destructive",
  critical: "destructive",
}

const RISK_BG: Record<RiskLevel, string> = {
  safe: "bg-emerald-500/10 border-emerald-500/30",
  cautious: "bg-blue-500/10 border-blue-500/30",
  warning: "bg-amber-500/10 border-amber-500/30",
  danger: "bg-orange-500/10 border-orange-500/30",
  critical: "bg-red-500/10 border-red-500/30",
}

function RiskIcon({ level, className }: { level: RiskLevel; className?: string }) {
  if (level === "safe" || level === "cautious") {
    return <ShieldCheck className={cn("size-5", className)} />
  }
  if (level === "warning") {
    return <ShieldAlert className={cn("size-5", className)} />
  }
  return <ShieldX className={cn("size-5", className)} />
}

export interface RiskIndicatorProps {
  state: FinanceState
  balanceOverride?: number
  extraUnexpected?: number
  showDetails?: boolean
  compact?: boolean
  "aria-label"?: string
}

export function RiskIndicator({
  state,
  balanceOverride,
  extraUnexpected,
  showDetails = true,
  compact = false,
}: RiskIndicatorProps) {
  const assessment = assessRisk(state, balanceOverride, extraUnexpected)
  const balance = balanceOverride ?? getBalance(state)
  const unexpectedTotal = getTotalUnexpected(state) + (extraUnexpected ?? 0)
  const subscriptionsTotal = getTotalSubscriptions(state)

  const message = RISK_MESSAGES[assessment.level]
  const messageKey = `risk-message-${assessment.level}`

  return (
    <Card
      className={cn(
        "border-2 transition-colors duration-500",
        RISK_BG[assessment.level]
      )}
      role="region"
      aria-label="Financial risk indicator"
    >
      <CardContent className={cn(compact ? "p-4" : "p-6")}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                RISK_BG[assessment.level],
                RISK_COLORS[assessment.level]
              )}
            >
              <RiskIcon level={assessment.level} />
            </span>
            <div>
              <p
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                aria-hidden="true"
              >
                Risk Score
              </p>
              <p
                className={cn("text-2xl font-bold tabular-nums", RISK_COLORS[assessment.level])}
                aria-label={`Risk score: ${assessment.score} out of 100`}
              >
                {assessment.score}
                <span className="text-sm text-muted-foreground">/100</span>
              </p>
            </div>
          </div>
          <Badge
            variant={RISK_BADGE_VARIANT[assessment.level]}
            className={cn("text-sm", RISK_COLORS[assessment.level])}
            aria-label={`Risk level: ${RISK_LABELS[assessment.level]}`}
          >
            {RISK_LABELS[assessment.level]}
          </Badge>
        </div>

        <Progress
          value={assessment.score}
          className={cn("mt-4 h-2", RISK_BAR_COLORS[assessment.level])}
          aria-label="Risk score progress"
        />

        <p
          key={messageKey}
          className="mt-3 text-sm font-medium text-foreground"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>

        {showDetails && (
          <>
            <Separator className="my-4" />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Current Balance</dt>
                <dd
                  className={cn(
                    "font-semibold tabular-nums",
                    balance < 0 && "text-destructive"
                  )}
                >
                  {formatINR(balance)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Daily Allowance</dt>
                <dd className="font-semibold tabular-nums">
                  {formatINR(assessment.dailyAllowance)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Days Until Broke</dt>
                <dd className="font-semibold tabular-nums">
                  {assessment.daysUntilBroke} days
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Unexpected Penalty</dt>
                <dd
                  className={cn(
                    "font-semibold tabular-nums",
                    assessment.unexpectedPenalty > 0 && "text-destructive"
                  )}
                >
                  -{assessment.unexpectedPenalty} pts
                </dd>
              </div>
            </dl>

            {(unexpectedTotal > 0 || subscriptionsTotal > 0) && (
              <div className="mt-4 space-y-2">
                {unexpectedTotal > 0 && (
                  <div
                    className="flex items-center justify-between rounded-md bg-red-500/10 px-3 py-2 text-sm"
                    role="alert"
                  >
                    <span className="text-red-700 dark:text-red-400">
                      ⚠️ Unexpected expenses total
                    </span>
                    <span className="font-semibold text-red-700 dark:text-red-400">
                      {formatINR(unexpectedTotal)}
                    </span>
                  </div>
                )}
                {subscriptionsTotal > 0 && (
                  <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                    <span className="text-muted-foreground">
                      📱 Recurring subscriptions
                    </span>
                    <span className="font-semibold">
                      {formatINR(subscriptionsTotal)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
