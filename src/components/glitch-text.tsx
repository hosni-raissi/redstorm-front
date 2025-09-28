"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface GlitchTextProps {
  children: React.ReactNode
  className?: string
  intensity?: "low" | "medium" | "high"
}

export function GlitchText({ children, className, intensity = "medium" }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        // 10% chance to glitch
        setIsGlitching(true)
        setTimeout(() => setIsGlitching(false), 150)
      }
    }, 2000)

    return () => clearInterval(glitchInterval)
  }, [])

  const getGlitchIntensity = () => {
    switch (intensity) {
      case "low":
        return "animate-pulse"
      case "high":
        return "animate-bounce"
      default:
        return "animate-pulse"
    }
  }

  return (
    <span
      className={cn(
        "relative inline-block",
        isGlitching && "glitch-text",
        isGlitching && getGlitchIntensity(),
        className,
      )}
      style={{
        textShadow: isGlitching ? "0.05em 0 0 #00ffff, -0.03em -0.04em 0 #ff00ff, 0.025em 0.04em 0 #ffff00" : "none",
      }}
    >
      {children}
    </span>
  )
}
