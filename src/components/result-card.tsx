"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Clock, CheckCircle2, AlertTriangle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/translations"
import type { Language } from "@/components/language-toggle"
import type {
  PhaseResult,
  PreengagementResults,
  ReconnaissanceResults,
  ScanningResults,
  VulnerabilityResults,
  ExploitationResults,
} from "@/lib/types"

interface ResultCardProps {
  result: PhaseResult
  language: Language
  onViewJson: (phaseId: string) => void
  isJsonVisible: boolean
}

export function ResultCard({ result, language, onViewJson, isJsonVisible }: ResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const t = useTranslation(language)

  const getPhaseTitle = (phase: string) => {
    const titles: Record<string, string> = {
      preengagement: t.steps?.preengagement || "Pre-engagement",
      reconnaissance: t.steps?.reconnaissance || "Reconnaissance",
      scanning: t.steps?.scanning || "Scanning",
      vulnerability: t.steps?.vulnerability || "Vulnerability",
      exploitation: t.steps?.exploitation || "Exploitation",
    }
    return titles[phase] || phase
  }

  const renderResults = () => {
    const { results: data, phase } = result

    switch (phase) {
      case "preengagement": {
        const preData = data as PreengagementResults
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-card/30 border border-neon-cyan/20">
              <span className="text-sm text-muted-foreground">Target</span>
              <span className="font-mono text-neon-cyan">{preData.target}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-card/30 border border-neon-cyan/20">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="font-mono text-neon-cyan">{preData.is_valid ? "VALID" : "INVALID"}</span>
            </div>
            {preData.ip_address && (
              <div className="flex items-center justify-between p-3 rounded bg-card/30 border border-neon-cyan/20">
                <span className="text-sm text-muted-foreground">IP Address</span>
                <span className="font-mono text-neon-cyan">{preData.ip_address}</span>
              </div>
            )}
          </div>
        )
      }

      case "reconnaissance": {
        const reconData = data as ReconnaissanceResults
        return (
          <div className="space-y-3">
            {reconData.dns_records && (
              <div className="p-3 rounded bg-card/30 border border-neon-cyan/20">
                <div className="text-sm text-muted-foreground mb-2">DNS Records</div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {Object.entries(reconData.dns_records).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs font-mono break-words"
                    >
                      <span className="text-neon-yellow">{key}</span>
                      <span className="text-neon-cyan break-all">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {reconData.subdomains && reconData.subdomains.length > 0 && (
              <div className="p-3 rounded bg-card/30 border border-neon-cyan/20">
                <div className="text-sm text-muted-foreground mb-2">Subdomains ({reconData.subdomains.length})</div>
                <div className="flex flex-wrap gap-2">
                  {reconData.subdomains.slice(0, 5).map((sub, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded text-xs font-mono bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 break-all"
                    >
                      {typeof sub === "string" ? sub : sub.subdomain}
                    </span>
                  ))}
                  {reconData.subdomains.length > 5 && (
                    <span className="px-2 py-1 rounded text-xs font-mono text-muted-foreground">
                      +{reconData.subdomains.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      }

      case "scanning": {
        const scanData = data as ScanningResults
        return (
          <div className="space-y-3">
            {scanData.open_ports && scanData.open_ports.length > 0 && (
              <div className="p-3 rounded bg-card/30 border border-neon-cyan/20">
                <div className="text-sm text-muted-foreground mb-2">Open Ports ({scanData.open_ports.length})</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scanData.open_ports.map((port, i) => (
                    <div key={i} className="p-2 rounded bg-neon-cyan/5 border border-neon-cyan/20">
                      <div className="font-mono text-neon-cyan text-lg">{port.port}</div>
                      <div className="text-xs text-muted-foreground truncate">{port.service || "Unknown"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      }

      case "vulnerability": {
        const vulnData = data as VulnerabilityResults
        const vulnCount = vulnData.vulnerabilities?.length || 0
        const criticalCount = vulnData.vulnerabilities?.filter((v) => v.severity === "critical").length || 0
        const highCount = vulnData.vulnerabilities?.filter((v) => v.severity === "high").length || 0

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded bg-card/30 border border-neon-pink/30 text-center">
                <div className="text-2xl font-bold text-neon-pink">{criticalCount}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div className="p-3 rounded bg-card/30 border border-neon-yellow/30 text-center">
                <div className="text-2xl font-bold text-neon-yellow">{highCount}</div>
                <div className="text-xs text-muted-foreground">High</div>
              </div>
              <div className="p-3 rounded bg-card/30 border border-neon-cyan/30 text-center">
                <div className="text-2xl font-bold text-neon-cyan">{vulnCount}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
            {vulnData.vulnerabilities && vulnData.vulnerabilities.length > 0 && (
              <div className="space-y-2">
                {vulnData.vulnerabilities.slice(0, 3).map((vuln, i) => (
                  <div key={i} className="p-3 rounded bg-card/30 border border-neon-cyan/20">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-mono text-sm text-neon-cyan">{vuln.name}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          vuln.severity === "critical"
                            ? "bg-neon-pink/20 text-neon-pink"
                            : vuln.severity === "high"
                              ? "bg-neon-yellow/20 text-neon-yellow"
                              : "bg-neon-cyan/20 text-neon-cyan"
                        }`}
                      >
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{vuln.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      case "exploitation": {
        const exploitData = data as ExploitationResults
        return (
          <div className="space-y-3">
            {exploitData.exploits && exploitData.exploits.length > 0 && (
              <div className="space-y-2">
                {exploitData.exploits.map((exploit, i) => (
                  <div key={i} className="p-3 rounded bg-card/30 border border-neon-cyan/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm text-neon-cyan">{exploit.name}</span>
                      {exploit.success ? (
                        <CheckCircle2 className="h-4 w-4 text-neon-cyan" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-neon-yellow" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{exploit.description}</p>
                    <div className="text-xs font-mono text-muted-foreground">
                      Status:{" "}
                      <span className={exploit.success ? "text-neon-cyan" : "text-neon-yellow"}>
                        {exploit.success ? "SUCCESS" : "FAILED"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      default:
        return <pre className="text-xs font-mono overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    }
  }

  return (
    <div className="glow-card rounded-lg overflow-hidden">
      <div className="p-4 border-b border-neon-cyan/30 bg-card/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-neon-cyan pulse-glow" />
            <h3 className="font-bold text-base sm:text-lg neon-text truncate">{getPhaseTitle(result.phase)}</h3>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="font-mono hidden sm:inline">{result.execution_time_seconds.toFixed(2)}s</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewJson(result.phase)}
              className={`h-8 w-8 p-0 ${isJsonVisible ? "text-neon-cyan" : ""}`}
              title="View JSON"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      {isExpanded && <div className="p-4">{renderResults()}</div>}
    </div>
  )
}
