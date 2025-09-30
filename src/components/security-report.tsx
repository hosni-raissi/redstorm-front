"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Download, Shield, AlertTriangle, CheckCircle, XCircle, Eye, FileText, Bug, Zap } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface SecurityReport {
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

interface SecurityReportProps {
  report: SecurityReport | null
  onDownload: () => void
}

export function SecurityReport({ report, onDownload }: SecurityReportProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("overview")

  if (!report) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">{t("noReportAvailable")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSeverityColor = (status: string) => {
    switch (status) {
      case "error":
        return "text-red-400 bg-red-400/10 border-red-400/20"
      case "warning":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
      case "success":
        return "text-green-400 bg-green-400/10 border-green-400/20"
      default:
        return "text-blue-400 bg-blue-400/10 border-blue-400/20"
    }
  }

  const getSeverityIcon = (status: string) => {
    switch (status) {
      case "error":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const downloadReport = () => {
    const reportData = {
      ...report,
      generatedAt: new Date().toISOString(),
      format: "JSON",
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `security-report-${report.url.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onDownload()
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                {t("securityReport")}
              </CardTitle>
              <CardDescription>
                {t("target")}: <span className="font-mono text-foreground">{report.url}</span>
              </CardDescription>
              <CardDescription>
                {t("generated")}: {new Date(report.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{report.overallScore}/100</div>
                <div className="text-sm text-muted-foreground">{t("securityScore")}</div>
              </div>
              <Button onClick={downloadReport} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                {t("downloadReport")}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
          <TabsTrigger value="details">{t("detailedFindings")}</TabsTrigger>
          <TabsTrigger value="recommendations">{t("recommendations")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-red-400/20 bg-red-400/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-red-400" />
                  <div>
                    <div className="text-2xl font-bold text-red-400">{report.summary.criticalIssues}</div>
                    <div className="text-sm text-muted-foreground">{t("critical")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-400/20 bg-yellow-400/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{report.summary.warnings}</div>
                    <div className="text-sm text-muted-foreground">{t("warnings")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-400/20 bg-blue-400/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{report.summary.vulnerabilities}</div>
                    <div className="text-sm text-muted-foreground">{t("vulnerabilities")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-400/20 bg-green-400/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-green-400">{report.summary.passed}</div>
                    <div className="text-sm text-muted-foreground">{t("passed")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Score Progress */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>{t("securityScore")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t("overallSecurity")}</span>
                  <span>{report.overallScore}/100</span>
                </div>
                <Progress value={report.overallScore} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {report.overallScore >= 80
                    ? t("excellent")
                    : report.overallScore >= 60
                      ? t("good")
                      : report.overallScore >= 40
                        ? t("fair")
                        : t("poor")}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {Object.entries(report.details).map(([section, data]) => (
            <Card key={section} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize flex items-center gap-2">
                    {getSeverityIcon(data.status)}
                    {t(section)}
                  </CardTitle>
                  <Badge className={getSeverityColor(data.status)}>{t(data.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{data.details}</p>
                {data.findings.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">{t("findings")}:</h4>
                    <ul className="space-y-1">
                      {data.findings.map((finding, index) => (
                        <li
                          key={index}
                          className="text-sm font-mono bg-muted/50 p-2 rounded border-l-2 border-blue-400"
                        >
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {t("duration")}: {data.duration}ms
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>{t("securityRecommendations")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {report.summary.criticalIssues > 0 && (
                  <div className="p-4 border border-red-400/20 bg-red-400/5 rounded-lg">
                    <h4 className="font-semibold text-red-400 mb-2">{t("criticalActions")}</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• {t("patchCriticalVulnerabilities")}</li>
                      <li>• {t("updateSecurityHeaders")}</li>
                      <li>• {t("implementAccessControls")}</li>
                    </ul>
                  </div>
                )}

                {report.summary.warnings > 0 && (
                  <div className="p-4 border border-yellow-400/20 bg-yellow-400/5 rounded-lg">
                    <h4 className="font-semibold text-yellow-400 mb-2">{t("recommendedActions")}</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• {t("enableHttpsRedirect")}</li>
                      <li>• {t("configureCSP")}</li>
                      <li>• {t("updateDependencies")}</li>
                    </ul>
                  </div>
                )}

                <div className="p-4 border border-blue-400/20 bg-blue-400/5 rounded-lg">
                  <h4 className="font-semibold text-blue-400 mb-2">{t("bestPractices")}</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• {t("regularSecurityAudits")}</li>
                    <li>• {t("monitorSecurityLogs")}</li>
                    <li>• {t("implementWAF")}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
