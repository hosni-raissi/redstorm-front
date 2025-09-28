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
import { useTranslation, type Language } from "@/lib/translations"

export type ScanStep = "validation" | "reconnaissance" | "enumeration" | "scan" | "vulnerability" | "exploit" | "report"
export type StepStatus = "pending" | "running" | "completed" | "failed"

interface ScanProgress {
  step: ScanStep
  status: StepStatus
  message?: string
  timestamp?: string
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

export function UrlScanner({ language }: UrlScannerProps) {
  const t = useTranslation(language)
  const [url, setUrl] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState<ScanProgress[]>([])
  const [currentStep, setCurrentStep] = useState<number>(-1)
  const [securityReport, setSecurityReport] = useState<SecurityReportData | null>(null)
  const [showReport, setShowReport] = useState(false)

  const scanSteps: ScanStep[] = [
    "validation",
    "reconnaissance",
    "enumeration",
    "scan",
    "vulnerability",
    "exploit",
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

  const getRandomErrorMessage = () => {
    const errors = [t.errorMessages.connectionTimeout, t.errorMessages.accessDenied, t.errorMessages.networkError]
    return errors[Math.floor(Math.random() * errors.length)]
  }

  const generateMockReport = (targetUrl: string): SecurityReportData => {
    const vulnerabilities = Math.floor(Math.random() * 15) + 1
    const criticalIssues = Math.floor(Math.random() * 3)
    const warnings = Math.floor(Math.random() * 8) + 2
    const passed = Math.floor(Math.random() * 20) + 10

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
          status: "success",
          findings: ["URL format is valid", "Target is accessible", "SSL certificate is valid"],
          details: "Target URL validation completed successfully. The target is reachable and responds to requests.",
          duration: 1250,
        },
        reconnaissance: {
          status: "warning",
          findings: ["Server: Apache/2.4.41", "Technology: PHP 7.4", "Framework: WordPress 5.8"],
          details:
            "Information gathering revealed server details and technology stack. Some version information is exposed.",
          duration: 3200,
        },
        enumeration: {
          status: "warning",
          findings: ["Open ports: 80, 443, 22", "Directory listing enabled", "Admin panel accessible"],
          details:
            "Service enumeration found several open ports and accessible endpoints that may pose security risks.",
          duration: 4500,
        },
        scan: {
          status: criticalIssues > 0 ? "error" : "warning",
          findings: [
            "SQL injection vulnerability detected",
            "Cross-site scripting (XSS) possible",
            "Outdated software components",
            "Missing security headers",
          ],
          details: "Vulnerability scanning identified multiple security issues requiring immediate attention.",
          duration: 8900,
        },
        vulnerability: {
          status: criticalIssues > 0 ? "error" : "warning",
          findings: [
            `${criticalIssues} critical vulnerabilities`,
            `${warnings} medium-risk issues`,
            "OWASP Top 10 violations detected",
          ],
          details:
            "Comprehensive vulnerability assessment completed. Risk levels have been categorized and prioritized.",
          duration: 5600,
        },
        exploitation: {
          status: criticalIssues > 0 ? "error" : "success",
          findings:
            criticalIssues > 0
              ? [
                  "SQL injection exploit successful",
                  "Privilege escalation possible",
                  "Data exfiltration risk confirmed",
                ]
              : ["No critical exploits successful", "Security controls are effective", "Attack surface is limited"],
          details:
            criticalIssues > 0
              ? "Exploitation testing confirmed the presence of exploitable vulnerabilities that could lead to system compromise."
              : "Exploitation testing did not reveal any immediately exploitable vulnerabilities.",
          duration: 6800,
        },
      },
    }
  }

  const simulateScan = async () => {
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

    for (let i = 0; i < scanSteps.length; i++) {
      setCurrentStep(i)

      const duration = Math.random() * 2000 + 2000
      await new Promise((resolve) => setTimeout(resolve, duration))

      const shouldFail = Math.random() < 0.1 && i > 0
      const status: StepStatus = shouldFail ? "failed" : "completed"

      setScanProgress((prev) =>
        prev.map((item, index) => {
          if (index === i) {
            return {
              ...item,
              status,
              timestamp: new Date().toLocaleTimeString(),
              message: shouldFail ? getRandomErrorMessage() : undefined,
            }
          } else if (index === i + 1 && !shouldFail) {
            return {
              ...item,
              status: "running",
              timestamp: new Date().toLocaleTimeString(),
            }
          }
          return item
        }),
      )

      if (shouldFail) {
        setIsScanning(false)
        return
      }
    }

    const report = generateMockReport(url)
    setSecurityReport(report)
    setShowReport(true)

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
                onClick={isScanning ? resetScan : simulateScan}
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

        {/* Security Report Section */}
        {showReport && <SecurityReport report={securityReport} onDownload={handleReportDownload} />}
      </div>
    </TooltipProvider>
  )
}
