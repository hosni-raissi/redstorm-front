"use client"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type Language = "en" | "fr"

interface LanguageToggleProps {
  language: Language
  onLanguageChange: (lang: Language) => void
}

export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-cyber-neon/30 hover:border-cyber-neon hover:bg-cyber-neon/10 transition-all duration-300 bg-transparent"
        >
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        <DropdownMenuItem
          onClick={() => onLanguageChange("en")}
          className={`cursor-pointer ${language === "en" ? "bg-primary/20" : ""}`}
        >
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onLanguageChange("fr")}
          className={`cursor-pointer ${language === "fr" ? "bg-primary/20" : ""}`}
        >
          🇫🇷 Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
