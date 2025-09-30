# Backend API Integration Guide

This cybersecurity dashboard is now connected to the FastAPI backend for real-time security analysis.

## Backend Setup

1. **Start the FastAPI Backend**
   \`\`\`bash
   cd /path/to/backend
   python modular_api.py
   \`\`\`
   The backend will run on `http://localhost:8000`

2. **Configure Frontend API URL**
   - Update `.env.local` with your backend URL:
     \`\`\`
     NEXT_PUBLIC_API_URL=http://localhost:8000
     \`\`\`
   - For production, update this to your deployed backend URL

## API Endpoints Used

### Phase Endpoints
The frontend calls these endpoints sequentially:

1. **Pre-Engagement** - `POST /api/v1/phases/preengagement`
   - Validates target URL and checks reachability
   - Returns: `is_available`, `message`, `execution_time_seconds`

2. **Reconnaissance** - `POST /api/v1/phases/reconnaissance`
   - DNS enumeration, subdomain discovery, WHOIS lookup
   - Returns: `subdomains_found`, DNS records, WHOIS data

3. **Scanning** - `POST /api/v1/phases/scanning`
   - Port scanning and service detection
   - Returns: `ports_found[]` with service details

4. **Vulnerability** - `POST /api/v1/phases/vulnerability`
   - Vulnerability scanning and assessment
   - Returns: `vulnerabilities_found`, severity breakdown

5. **Exploitation** - `POST /api/v1/phases/exploitation`
   - Exploitation simulation
   - Returns: `exploits_simulated`, `successful_simulations`

6. **Report Generation** - `POST /api/v1/reports/generate`
   - Generates comprehensive report using Ollama AI
   - Returns: `report_content`, `phases_used`, cleanup status

### Request Format
All phase endpoints accept:
\`\`\`json
{
  "target": "https://example.com",
  "client_id": "client-unique-id",
  "options": {}
}
\`\`\`

### Response Format
All phase endpoints return:
\`\`\`json
{
  "phase": "phase_name",
  "target": "https://example.com",
  "client_id": "client-unique-id",
  "status": "completed",
  "results": { /* phase-specific data */ },
  "execution_time_seconds": 2.5,
  "timestamp": "2025-01-15T10:30:00",
  "phase_id": "phase_target_timestamp"
}
\`\`\`

## How It Works

1. **User enters target URL** and clicks "Start Security Scan"
2. **Frontend generates unique client_id** for tracking
3. **Sequential phase execution**:
   - Each phase calls its backend API endpoint
   - Real-time progress updates shown in UI
   - Phase results stored and displayed
   - If any phase fails, scan stops
4. **Report generation**:
   - Calls report generation endpoint
   - Backend uses Ollama AI to generate comprehensive report
   - Backend automatically cleans up temporary data
5. **Results display**:
   - Security report shown with all findings
   - Download option available
   - Real execution times displayed

## Error Handling

- **Connection errors**: Displayed in red with error message
- **Phase failures**: Scan stops, error shown for failed phase
- **Timeout handling**: Backend handles timeouts per phase
- **Network issues**: Caught and displayed to user

## CORS Configuration

The backend is configured to accept requests from any origin:
\`\`\`python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
\`\`\`

For production, update `allow_origins` to your frontend domain.

## Testing

1. **Check backend health**:
   \`\`\`bash
   curl http://localhost:8000/health
   \`\`\`

2. **Test single phase**:
   \`\`\`bash
   curl -X POST http://localhost:8000/api/v1/phases/preengagement \
     -H "Content-Type: application/json" \
     -d '{"target": "https://example.com", "client_id": "test-123"}'
   \`\`\`

3. **View available phases**:
   \`\`\`bash
   curl http://localhost:8000/api/v1/phases/available
   \`\`\`

## Debugging

The frontend includes console logging for debugging:
- `[v0] Calling {phase} API for {target}` - API call started
- `[v0] {phase} API response:` - API response received
- `[v0] {phase} API error:` - API call failed

Check browser console for detailed logs during scanning.
