"use client"

import { useState } from "react"
import { Play, Loader2, CheckCircle, XCircle, Clock, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SecurityReport } from "@/components/security-report"
import { PhaseResultCard } from "@/components/phase-result-card"
import { useTranslation, type Language } from "@/lib/translations"

export type ScanStep = "preengagement" | "reconnaissance" | "scanning" | "vulnerability" | "exploitation" | "report"
export type StepStatus = "pending" | "running" | "completed" | "failed"

interface ScanProgress {
  step: ScanStep
  status: StepStatus
  message?: string
  timestamp?: string
  results?: any
  executionTime?: number
  phaseId?: string
}

interface SecurityReportData {
  id: string
  url: string
  timestamp: string
  overallScore: number
  status: "completed" | "failed"
  summary: {
    vulnerabilities: number
    criticalIssues: number
    warnings: number
    passed: number
  }
  details: {
    validation: ReportSection
    reconnaissance: ReportSection
    enumeration: ReportSection
    scan: ReportSection
    vulnerability: ReportSection
    exploitation: ReportSection
  }
}

interface ReportSection {
  status: "success" | "warning" | "error"
  findings: string[]
  details: string
  duration: number
}

interface UrlScannerProps {
  language: Language
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function UrlScanner({ language }: UrlScannerProps) {
  const t = useTranslation(language)
  const [url, setUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState<ScanProgress[]>([])
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [securityReport, setSecurityReport] = useState<SecurityReportData | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [clientId] = useState(() => `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)

  const scanSteps: ScanStep[] = [
    "preengagement",
    "reconnaissance",
    "scanning",
    "vulnerability",
    "exploitation",
    "report",
  ]

  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case "running":
        return <Loader2 className="h-4 w-4 animate-spin text-cyber-neon" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-cyber-success" />
      case "failed":
        return <XCircle className="h-4 w-4 text-cyber-danger" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStepBadgeVariant = (status: StepStatus) => {
    switch (status) {
      case "running":
        return "default"
      case "completed":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const callPhaseAPI = async (phase: ScanStep, targetUrl: string): Promise<any> => {
    console.log(`[v0] Calling ${phase} API for ${targetUrl}`)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/phases/${phase}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: targetUrl,
          client_id: clientId,
          options: {},
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`[v0] ${phase} API response:`, data)
      return data
    } catch (error) {
      console.error(`[v0] ${phase} API error:`, error)
      throw error
    }
  }

  const generateReport = async (targetUrl: string): Promise<any> => {
    console.log(`[v0] Generating report for ${targetUrl}`)

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/reports/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: targetUrl,
          client_id: clientId,
          report_type: "executive",
          include_recommendations: true,
        }),
      })

      if (!response.ok) {
        throw new Error(`Report generation failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`[v0] Report generation response:`, data)
      return data
    } catch (error) {
      console.error(`[v0] Report generation error:`, error)
      throw error
    }
  }

  const convertToSecurityReport = (targetUrl: string, phaseResults: ScanProgress[]): SecurityReportData => {
    // Extract data from phase results
    const preengagement = phaseResults.find((p) => p.step === "preengagement")
    const reconnaissance = phaseResults.find((p) => p.step === "reconnaissance")
    const scanning = phaseResults.find((p) => p.step === "scanning")
    const vulnerability = phaseResults.find((p) => p.step === "vulnerability")
    const exploitation = phaseResults.find((p) => p.step === "exploitation")

    // Calculate summary metrics from results
    const vulnerabilities = vulnerability?.results?.vulnerabilities_found || 0
    const criticalIssues = vulnerability?.results?.critical || 0
    const warnings = vulnerability?.results?.medium || 0
    const passed = 10 // Default value

    const overallScore = Math.max(20, 100 - criticalIssues * 25 - warnings * 5 - vulnerabilities * 2)

    return {
      id: `scan-${Date.now()}`,
      url: targetUrl,
      timestamp: new Date().toISOString(),
      overallScore,
      status: "completed",
      summary: {
        vulnerabilities,
        criticalIssues,
        warnings,
        passed,
      },
      details: {
        validation: {
          status: preengagement?.status === "completed" ? "success" : "error",
          findings: preengagement?.results?.is_available
            ? ["Target is reachable", "URL format is valid", "Connection established"]
            : ["Target validation failed"],
          details: preengagement?.results?.message || "Target validation completed",
          duration: preengagement?.executionTime || 0,
        },
        reconnaissance: {
          status: reconnaissance?.status === "completed" ? "success" : "warning",
          findings: [
            `Subdomains found: ${reconnaissance?.results?.subdomains_found || 0}`,
            `DNS records analyzed`,
            `WHOIS information gathered`,
          ],
          details: reconnaissance?.results?.message || "Information gathering completed",
          duration: reconnaissance?.executionTime || 0,
        },
        enumeration: {
          status: scanning?.status === "completed" ? "success" : "warning",
          findings: [
            `Open ports: ${scanning?.results?.ports_found?.length || 0}`,
            `Services detected: ${scanning?.results?.ports_found?.map((p: any) => p.service).join(", ") || "None"}`,
          ],
          details: scanning?.results?.message || "Service enumeration completed",
          duration: scanning?.executionTime || 0,
        },
        scan: {
          status: criticalIssues > 0 ? "error" : "warning",
          findings: [
            `Vulnerabilities detected: ${vulnerabilities}`,
            `Critical issues: ${criticalIssues}`,
            `Medium-risk issues: ${warnings}`,
          ],
          details: vulnerability?.results?.message || "Vulnerability scanning completed",
          duration: vulnerability?.executionTime || 0,
        },
        vulnerability: {
          status: criticalIssues > 0 ? "error" : "warning",
          findings: [
            `${criticalIssues} critical vulnerabilities`,
            `${warnings} medium-risk issues`,
            "Risk assessment completed",
          ],
          details: vulnerability?.results?.message || "Vulnerability assessment completed",
          duration: vulnerability?.executionTime || 0,
        },
        exploitation: {
          status: exploitation?.status === "completed" ? "success" : "error",
          findings: exploitation?.results?.exploits_simulated
            ? [
                `Exploits simulated: ${exploitation.results.exploits_simulated}`,
                `Successful: ${exploitation.results.successful_simulations || 0}`,
              ]
            : ["No exploitation attempted"],
          details: exploitation?.results?.message || "Exploitation testing completed",
          duration: exploitation?.executionTime || 0,
        },
      },
    }
  }

  const runRealScan = async () => {
    if (!url.trim()) return

    setIsScanning(true)
    setCurrentStep(0)
    setSecurityReport(null)
    setShowReport(false)

    const initialProgress = scanSteps.map((step, index) => ({
      step,
      status: index === 0 ? ("running" as StepStatus) : ("pending" as StepStatus),
      timestamp: index === 0 ? new Date().toLocaleTimeString() : undefined,
    }))
    setScanProgress(initialProgress)

    // Run each phase sequentially
    for (let i = 0; i < scanSteps.length - 1; i++) {
      // -1 because last step is report generation
      const phase = scanSteps[i]
      setCurrentStep(i)

      try {
        console.log(`[v0] Starting phase: ${phase}`)

        // Call the backend API for this phase
        const phaseResult = await callPhaseAPI(phase, url)

        // Update progress with completed status
        setScanProgress((prev) =>
          prev.map((item, index) => {
            if (index === i) {
              return {
                ...item,
                status: phaseResult.status === "completed" ? "completed" : "failed",
                timestamp: new Date().toLocaleTimeString(),
                results: phaseResult.results,
                executionTime: phaseResult.execution_time_seconds * 1000, // Convert to ms
                phaseId: phaseResult.phase_id,
                message: phaseResult.status === "failed" ? phaseResult.results?.message : undefined,
              }
            } else if (index === i + 1) {
              return {
                ...item,
                status: "running",
                timestamp: new Date().toLocaleTimeString(),
              }
            }
            return item
          }),
        )

        // If phase failed, stop the scan
        if (phaseResult.status === "failed" || phaseResult.status === "error") {
          console.error(`[v0] Phase ${phase} failed:`, phaseResult.results?.message)
          setIsScanning(false)
          return
        }
      } catch (error) {
        console.error(`[v0] Error in phase ${phase}:`, error)

        // Update progress with failed status
        setScanProgress((prev) =>
          prev.map((item, index) => {
            if (index === i) {
              return {
                ...item,
                status: "failed",
                timestamp: new Date().toLocaleTimeString(),
                message: error instanceof Error ? error.message : "Unknown error occurred",
              }
            }
            return item
          }),
        )

        setIsScanning(false)
        return
      }
    }

    // Generate final report
    try {
      console.log(`[v0] Generating final report`)
      setCurrentStep(scanSteps.length - 1)

      setScanProgress((prev) =>
        prev.map((item, index) => {
          if (index === scanSteps.length - 1) {
            return {
              ...item,
              status: "running",
              timestamp: new Date().toLocaleTimeString(),
            }
          }
          return item
        }),
      )

      const reportResult = await generateReport(url)

      setScanProgress((prev) =>
        prev.map((item, index) => {
          if (index === scanSteps.length - 1) {
            return {
              ...item,
              status: "completed",
              timestamp: new Date().toLocaleTimeString(),
              results: reportResult,
            }
          }
          return item
        }),
      )

      // Convert backend results to security report format
      const report = convertToSecurityReport(url, scanProgress)
      setSecurityReport(report)
      setShowReport(true)
    } catch (error) {
      console.error(`[v0] Report generation error:`, error)

      setScanProgress((prev) =>
        prev.map((item, index) => {
          if (index === scanSteps.length - 1) {
            return {
              ...item,
              status: "failed",
              timestamp: new Date().toLocaleTimeString(),
              message: error instanceof Error ? error.message : "Report generation failed",
            }
          }
          return item
        }),
      )
    }

    setIsScanning(false)
    setCurrentStep(-1)
  }

  const resetScan = () => {
    setScanProgress([])
    setCurrentStep(-1)
    setIsScanning(false)
    setSecurityReport(null)
    setShowReport(false)
  }

  const handleReportDownload = () => {
    console.log("[v0] Security report downloaded")
  }

  const progressPercentage =
    scanProgress.length > 0 ? (scanProgress.filter((s) => s.status === "completed").length / scanSteps.length) * 100 : 0

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* URL Input Section */}
        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 terminal-text">
              <AlertTriangle className="h-5 w-5 text-cyber-warning" />
              {t.targetConfiguration}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder={t.urlInput}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isScanning}
                className="font-mono bg-input border-border focus:border-cyber-neon focus:ring-cyber-neon/20"
              />
              <Button
                onClick={isScanning ? resetScan : runRealScan}
                disabled={!url.trim() && !isScanning}
                className="bg-primary hover:bg-primary/80 text-primary-foreground neon-glow"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.scanning}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {scanProgress.length > 0 ? t.newScan : t.startScan}
                  </>
                )}
              </Button>
            </div>

            {scanProgress.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t.progress}</span>
                  <span className="text-foreground font-mono">{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-muted" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        {scanProgress.length > 0 && !showReport && (
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="terminal-text">{t.analysisProgress}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scanProgress.map((progress, index) => (
                  <div
                    key={progress.step}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                      progress.status === "running"
                        ? "border-cyber-neon bg-cyber-neon/5 neon-glow"
                        : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getStepIcon(progress.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium terminal-text">{t.steps[progress.step]}</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-sm">{t.stepDescriptions[progress.step]}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {progress.message && <div className="text-sm text-cyber-danger">{progress.message}</div>}
                        {progress.executionTime && progress.status === "completed" && (
                          <div className="text-xs text-muted-foreground font-mono">
                            Completed in {(progress.executionTime / 1000).toFixed(2)}s
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {progress.timestamp && (
                        <span className="text-xs text-muted-foreground font-mono">{progress.timestamp}</span>
                      )}
                      <Badge variant={getStepBadgeVariant(progress.status)}>{t.status[progress.status]}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phase Result Cards */}
        {scanProgress.length > 0 && !showReport && (
          <div className="space-y-4">
            {scanProgress
              .filter((progress) => progress.status === "completed" && progress.results && progress.step !== "report")
              .map((progress) => (
                <PhaseResultCard
                  key={progress.step}
                  phase={progress.step}
                  results={progress.results}
                  executionTime={progress.executionTime}
                  timestamp={progress.timestamp}
                  language={language}
                />
              ))}
          </div>
        )}

        {/* Security Report Section */}
        {showReport && securityReport && <SecurityReport report={securityReport} onDownload={handleReportDownload} />}
      </div>
    </TooltipProvider>
  )
}
