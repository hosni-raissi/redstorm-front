"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Shield, Globe, Scan, Bug, Zap, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ScanStep } from "./url-scanner"

interface PhaseResultCardProps {
  phase: ScanStep
  results: any
  executionTime?: number
  timestamp?: string
  language: "en" | "fr"
}

export function PhaseResultCard({ phase, results, executionTime, timestamp, language }: PhaseResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getPhaseIcon = (phase: ScanStep) => {
    switch (phase) {
      case "preengagement":
        return <Shield className="h-5 w-5" />
      case "reconnaissance":
        return <Globe className="h-5 w-5" />
      case "scanning":
        return <Scan className="h-5 w-5" />
      case "vulnerability":
        return <Bug className="h-5 w-5" />
      case "exploitation":
        return <Zap className="h-5 w-5" />
      case "report":
        return <FileText className="h-5 w-5" />
    }
  }

  const getPhaseTitle = (phase: ScanStep) => {
    const titles = {
      en: {
        preengagement: "Target Validation",
        reconnaissance: "Reconnaissance",
        scanning: "Port Scanning",
        vulnerability: "Vulnerability Assessment",
        exploitation: "Exploitation Testing",
        report: "Report Generation",
      },
      fr: {
        preengagement: "Validation de la cible",
        reconnaissance: "Reconnaissance",
        scanning: "Analyse des ports",
        vulnerability: "Évaluation des vulnérabilités",
        exploitation: "Test d'exploitation",
        report: "Génération du rapport",
      },
    }
    return titles[language][phase]
  }

  const renderPreengagementResults = () => {
    if (!results) return null

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Status</div>
            <Badge variant={results.is_available ? "default" : "destructive"} className="font-mono">
              {results.is_available ? "Available" : "Unavailable"}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Response Time</div>
            <div className="text-sm font-mono">{results.response_time_ms?.toFixed(2) || "N/A"} ms</div>
          </div>
        </div>

        {results.ip_address && (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">IP Address</div>
            <div className="text-sm font-mono text-cyber-neon">{results.ip_address}</div>
          </div>
        )}

        {results.message && (
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Message</div>
            <div className="text-sm">{results.message}</div>
          </div>
        )}
      </div>
    )
  }

  const renderReconnaissanceResults = () => {
    if (!results) return null

    return (
      <div className="space-y-4">
        {/* DNS Records */}
        {results.dns_records && Object.keys(results.dns_records).length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">DNS Records</div>
            <div className="space-y-2">
              {Object.entries(results.dns_records).map(([type, records]: [string, any]) => (
                <div key={type} className="space-y-1">
                  <Badge variant="outline" className="font-mono">
                    {type}
                  </Badge>
                  <div className="pl-4 space-y-1">
                    {Array.isArray(records) &&
                      records.map((record: string, idx: number) => (
                        <div key={idx} className="text-sm font-mono text-muted-foreground">
                          {record}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subdomains */}
        {results.subdomains && results.subdomains.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Subdomains Found ({results.subdomains.length})</div>
            <div className="grid grid-cols-2 gap-2">
              {results.subdomains.slice(0, 10).map((subdomain: string, idx: number) => (
                <div key={idx} className="text-sm font-mono text-cyber-neon">
                  {subdomain}
                </div>
              ))}
            </div>
            {results.subdomains.length > 10 && (
              <div className="text-xs text-muted-foreground">+{results.subdomains.length - 10} more subdomains</div>
            )}
          </div>
        )}

        {/* WHOIS Info */}
        {results.whois_info && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">WHOIS Information</div>
            <div className="space-y-1 text-sm">
              {results.whois_info.registrar && (
                <div>
                  <span className="text-muted-foreground">Registrar:</span>{" "}
                  <span className="font-mono">{results.whois_info.registrar}</span>
                </div>
              )}
              {results.whois_info.creation_date && (
                <div>
                  <span className="text-muted-foreground">Created:</span>{" "}
                  <span className="font-mono">{results.whois_info.creation_date}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderScanningResults = () => {
    if (!results) return null

    return (
      <div className="space-y-4">
        {results.ports_found && results.ports_found.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Open Ports ({results.ports_found.length})</div>
            <div className="space-y-2">
              {results.ports_found.map((port: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded border border-border bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {port.port}
                    </Badge>
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{port.service || "Unknown"}</div>
                      {port.version && <div className="text-xs text-muted-foreground">{port.version}</div>}
                    </div>
                  </div>
                  <Badge variant={port.state === "open" ? "default" : "secondary"}>{port.state}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.scan_summary && (
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Total Ports</div>
              <div className="text-lg font-mono text-cyber-neon">{results.scan_summary.total_ports || 0}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Open</div>
              <div className="text-lg font-mono text-cyber-success">{results.scan_summary.open_ports || 0}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Filtered</div>
              <div className="text-lg font-mono text-cyber-warning">{results.scan_summary.filtered_ports || 0}</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderVulnerabilityResults = () => {
    if (!results) return null

    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-mono text-foreground">{results.vulnerabilities_found || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Critical</div>
            <div className="text-2xl font-mono text-cyber-danger">{results.critical || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">High</div>
            <div className="text-2xl font-mono text-cyber-warning">{results.high || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Medium</div>
            <div className="text-2xl font-mono text-cyber-neon">{results.medium || 0}</div>
          </div>
        </div>

        {/* Vulnerability List */}
        {results.vulnerabilities && results.vulnerabilities.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Detected Vulnerabilities</div>
            <div className="space-y-2">
              {results.vulnerabilities.slice(0, 5).map((vuln: any, idx: number) => (
                <div key={idx} className="p-3 rounded border border-border bg-muted/20 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="text-sm font-medium">{vuln.name || vuln.title}</div>
                      {vuln.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">{vuln.description}</div>
                      )}
                    </div>
                    <Badge
                      variant={vuln.severity === "critical" || vuln.severity === "high" ? "destructive" : "secondary"}
                      className="ml-2"
                    >
                      {vuln.severity}
                    </Badge>
                  </div>
                  {vuln.cvss_score && (
                    <div className="text-xs font-mono text-muted-foreground">CVSS: {vuln.cvss_score}</div>
                  )}
                </div>
              ))}
            </div>
            {results.vulnerabilities.length > 5 && (
              <div className="text-xs text-muted-foreground">
                +{results.vulnerabilities.length - 5} more vulnerabilities
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderExploitationResults = () => {
    if (!results) return null

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Simulated</div>
            <div className="text-2xl font-mono text-foreground">{results.exploits_simulated || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Successful</div>
            <div className="text-2xl font-mono text-cyber-success">{results.successful_simulations || 0}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Failed</div>
            <div className="text-2xl font-mono text-muted-foreground">{results.failed_simulations || 0}</div>
          </div>
        </div>

        {results.exploits && results.exploits.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-foreground">Exploitation Attempts</div>
            <div className="space-y-2">
              {results.exploits.map((exploit: any, idx: number) => (
                <div key={idx} className="p-2 rounded border border-border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{exploit.name || exploit.type}</div>
                    <Badge variant={exploit.success ? "default" : "secondary"}>
                      {exploit.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  {exploit.details && <div className="text-xs text-muted-foreground mt-1">{exploit.details}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {results.message && (
          <div className="text-sm text-muted-foreground border-t border-border pt-3">{results.message}</div>
        )}
      </div>
    )
  }

  const renderResults = () => {
    switch (phase) {
      case "preengagement":
        return renderPreengagementResults()
      case "reconnaissance":
        return renderReconnaissanceResults()
      case "scanning":
        return renderScanningResults()
      case "vulnerability":
        return renderVulnerabilityResults()
      case "exploitation":
        return renderExploitationResults()
      default:
        return <div className="text-sm text-muted-foreground">No results available</div>
    }
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg terminal-text">
            <div className="text-cyber-neon">{getPhaseIcon(phase)}</div>
            {getPhaseTitle(phase)}
          </CardTitle>
          <div className="flex items-center gap-3">
            {executionTime && (
              <div className="text-xs text-muted-foreground font-mono">{(executionTime / 1000).toFixed(2)}s</div>
            )}
            {timestamp && <div className="text-xs text-muted-foreground font-mono">{timestamp}</div>}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && <CardContent className="pt-0">{renderResults()}</CardContent>}
    </Card>
  )
}
