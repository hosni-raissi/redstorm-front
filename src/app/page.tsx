"use client"
import { useState, useEffect } from "react"
import { Shield, Terminal, Zap } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle, type Language } from "@/components/language-toggle"
import { UrlScanner } from "@/components/url-scanner"
import { MatrixBackground } from "@/components/matrix-background"
import { CyberGrid } from "@/components/cyber-grid"
import { GlitchText } from "@/components/glitch-text"
import { TerminalCursor } from "@/components/terminal-cursor"
import { useTranslation } from "@/lib/translations"

export default function CyberSecDashboard() {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)
  const t = useTranslation(language)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MatrixBackground />
      <CyberGrid />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-cyber-neon" />
              <div className="absolute inset-0 animate-pulse">
                <Shield className="h-8 w-8 text-cyber-neon/30" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground terminal-text flex items-center">
                <GlitchText intensity="low">{t.title}</GlitchText>
                <TerminalCursor />
              </h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle language={language} onLanguageChange={setLanguage} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Terminal className="h-6 w-6 text-cyber-neon animate-pulse" />
              <Zap className="h-6 w-6 text-cyber-warning animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-balance terminal-text">
              <GlitchText intensity="medium">{t.welcomeTitle}</GlitchText>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              {t.welcomeDescription}
            </p>
          </div>
          <UrlScanner language={language} />
        </div>
      </main>

      {/* Client-only animated particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {mounted && Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyber-neon rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}