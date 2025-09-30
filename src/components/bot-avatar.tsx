"use client"

import { Bot, CheckCircle2, Loader2, XCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

interface BotAvatarProps {
  name: string
  role: string
  status: "idle" | "running" | "completed" | "error"
  isActive: boolean
  message?: string
}

export function BotAvatar({ name, role, status, isActive, message }: BotAvatarProps) {
  return (
    <Card className={`p-6 transition-all ${isActive ? "ring-2 ring-accent" : ""}`}>
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Bot Icon */}
        <div className="relative">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              status === "running" ? "bg-accent/20 animate-pulse" : status === "completed" ? "bg-accent/20" : "bg-muted"
            }`}
          >
            <Bot
              className={`h-8 w-8 ${status === "running" || status === "completed" ? "text-accent" : "text-muted-foreground"}`}
            />
          </div>
          {/* Status Indicator */}
          {status === "running" && (
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
              <Loader2 className="h-4 w-4 text-accent animate-spin" />
            </div>
          )}
          {status === "completed" && (
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
              <CheckCircle2 className="h-4 w-4 text-accent" />
            </div>
          )}
          {status === "error" && (
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
          )}
        </div>

        {/* Bot Info */}
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>

        {/* Message */}
        {message && (
          <div className="w-full p-3 bg-muted rounded-lg">
            <p className="text-sm">{message}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
