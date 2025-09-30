"use client"

import { useState } from "react"
import { Download, ChevronDown, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "@/lib/translations"
import type { Language } from "@/components/language-toggle"
import type { PhaseResult } from "@/lib/types"

interface JsonViewerProps {
  results: PhaseResult[]
  language: Language
}

export function JsonViewer({ results, language }: JsonViewerProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([0]))
  const t = useTranslation(language)

  const togglePhase = (index: number) => {
    const newExpanded = new Set(expandedPhases)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedPhases(newExpanded)
  }

  const downloadJson = () => {
    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `security-scan-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Scan Results</h3>
        <Button onClick={downloadJson} variant="outline" size="sm" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Download JSON
        </Button>
      </div>

      <Tabs defaultValue="formatted" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="formatted">Formatted</TabsTrigger>
          <TabsTrigger value="raw">Raw JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="formatted" className="space-y-4 mt-6">
          {results.map((result, index) => (
            <div key={index} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => togglePhase(index)}
                className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedPhases.has(index) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-medium capitalize">{result.phase}</span>
                  <span className="text-sm text-muted-foreground">{result.execution_time_seconds?.toFixed(2)}s</span>
                </div>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    result.status === "completed" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {result.status}
                </span>
              </button>

              {expandedPhases.has(index) && (
                <div className="p-4 bg-card">
                  <pre className="text-sm overflow-x-auto">
                    <code>{JSON.stringify(result.results, null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="raw" className="mt-6">
          <div className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm">
              <code>{JSON.stringify(results, null, 2)}</code>
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
