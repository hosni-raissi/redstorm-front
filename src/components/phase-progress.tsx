"use client"

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Phase {
  id: string
  name: string
}

interface PhaseProgressProps {
  phases: Phase[]
  statuses: Record<string, "idle" | "running" | "completed" | "error">
  currentPhase: string | null
}

export function PhaseProgress({ phases, statuses, currentPhase }: PhaseProgressProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Scan Progress</h3>
      <div className="space-y-4">
        {phases.map((phase, index) => {
          const status = statuses[phase.id]
          const isActive = currentPhase === phase.id

          return (
            <div key={phase.id} className="flex items-center gap-4">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {status === "completed" && <CheckCircle2 className="h-5 w-5 text-accent" />}
                {status === "running" && <Loader2 className="h-5 w-5 text-accent animate-spin" />}
                {status === "error" && <XCircle className="h-5 w-5 text-destructive" />}
                {status === "idle" && <Circle className="h-5 w-5 text-muted-foreground" />}
              </div>

              {/* Phase Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isActive ? "text-accent" : ""}`}>{phase.name}</span>
                  {status === "running" && <span className="text-sm text-muted-foreground">Running...</span>}
                  {status === "completed" && <span className="text-sm text-accent">Complete</span>}
                  {status === "error" && <span className="text-sm text-destructive">Failed</span>}
                </div>
                {/* Progress Bar */}
                <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      status === "completed"
                        ? "w-full bg-accent"
                        : status === "running"
                          ? "w-1/2 bg-accent animate-pulse"
                          : "w-0"
                    }`}
                  />
                </div>
              </div>

              {/* Connector Line */}
              {index < phases.length - 1 && (
                <div className="absolute left-[2.3rem] mt-12 w-0.5 h-8 bg-border" style={{ marginTop: "1rem" }} />
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
