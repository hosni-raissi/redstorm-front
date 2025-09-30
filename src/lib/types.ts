export interface PhaseResult {
  phase: string
  target: string
  client_id: string
  status: string
  results: PreengagementResults | ReconnaissanceResults | ScanningResults | VulnerabilityResults | ExploitationResults
  execution_time_seconds: number
  timestamp: string
  phase_id: string
}

export interface PreengagementResults {
  target: string
  is_valid: boolean
  is_available: boolean
  ip_address?: string
  message: string
}

export interface ReconnaissanceResults {
  target: string
  dns_records?: Record<string, string | string[]>
  subdomains?: Array<{
    subdomain: string
    status: string
  }>
  whois_info?: Record<string, string>
}

export interface ScanningResults {
  target: string
  open_ports?: Array<{
    port: number
    service: string
    state: string
  }>
  total_ports_scanned: number
}

export interface VulnerabilityResults {
  target: string
  vulnerabilities?: Array<{
    name: string
    severity: "critical" | "high" | "medium" | "low"
    description: string
    cve_id?: string
  }>
  total_vulnerabilities: number
}

export interface ExploitationResults {
  target: string
  exploits?: Array<{
    name: string
    description: string
    success: boolean
    details?: string
  }>
  total_exploits: number
  successful_exploits: number
}

export interface ReportResponse {
  report_id: string
  target: string
  client_id: string
  report_content: string
  phases_used: string[]
  generated_at: string
  cleanup_status: string
}
