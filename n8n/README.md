# n8n Backend for Asana Integration

## Overview
This folder contains n8n workflow configurations for integrating Asana with your time tracker dashboard.

## Workflows

### 1. `asana-project-sync-webhook.json` ⭐ (UPDATED - Google Sheets Filter)
- **Reads project IDs from Google Sheet** (your source of truth)
- Fetches only those specific projects from Asana
- Calculates estimated hours from tasks
- Sends data to your Next.js API endpoint
- Runs every 6 hours (configurable)

**Why Google Sheet Filter?**
- Only sync projects you care about (~87 projects)
- Skip archived/test projects automatically
- Easy to manage (just edit the sheet)
- Much faster execution

---

## Quick Start

### 1. Install n8n
```bash
# Docker (recommended)
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n

# or npm
npm install -g n8n
n8n start
```

### 2. Set Up Google Sheets
1. Go to n8n Credentials
2. Add "Google Sheets OAuth2 API"
3. Connect your Google account
4. Grant permissions

### 3. Set Up Asana
1. Get Personal Access Token: https://app.asana.com/0/my-apps
2. Add "Asana API" credential in n8n
3. Paste your token

### 4. Import Workflow
1. Open http://localhost:5678
2. Import `asana-project-sync-webhook.json`
3. Configure credentials
4. Test and activate

### 5. View Results
- Dashboard: http://localhost:3000/dashboard/variance
- Refresh to see synced projects

---

## Documentation

- **[GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)** - Complete Google Sheets integration guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common errors and solutions
- **[workflows/README.md](./workflows/README.md)** - Workflow details

---

## Workflow Diagram

```
┌──────────────────┐
│ Schedule Trigger │
│  (Every 6 hrs)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Read Google      │
│ Sheet Project    │
│ List (87 items)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Get Asana        │◄─── For each Project ID
│ Project Details  │     from Google Sheet
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Get Project      │
│ Tasks from Asana │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Calculate        │
│ Estimated Hours  │
│ (JS Code)        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Send to          │
│ Dashboard API    │
│ (Webhook)        │
└──────────────────┘
```

---

## Google Sheet Structure

**Sheet URL:** https://docs.google.com/spreadsheets/d/1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4/edit

| Column A          | Column B                              |
|-------------------|---------------------------------------|
| Project ID        | Project Name                          |
| 1206838393848201  | PSACC \| IT Service and Asset Mgmt   |
| 1206884302399649  | Landbank \| Ivanti Implementation    |
| ...               | ...                                   |

**To add a project:**
1. Add new row with Asana Project ID
2. Wait for next sync (or run manually)

**To remove a project:**
1. Delete row from sheet
2. Project stops syncing

---

## Configuration

### Sync Frequency
Edit "Schedule Every 6 Hours" node:
- Every 1 hour: `hoursInterval: 1`
- Every 12 hours: `hoursInterval: 12`
- Daily: Change to `days: 1`

### Google Sheet Range
Edit "Read Google Sheet Project List" node:
- Range: `A2:B100` (reads 99 projects max)
- Increase if needed: `A2:B200`

### Webhook URL
Edit "Send to Dashboard API" node:
- Local: `http://localhost:3000/api/webhooks/asana-sync`
- Production: `https://your-domain.com/api/webhooks/asana-sync`

---

## Testing

### Test Google Sheet Connection
1. Open "Read Google Sheet Project List" node
2. Click "Execute Node"
3. Should see all project IDs

### Test Full Workflow
1. Click "Execute Workflow"
2. Check each node turns green
3. View "Send to Dashboard API" response
4. Check `/dashboard/variance` in browser

---

## Production Deployment

### n8n Cloud (Easiest)
1. Sign up: https://n8n.io/cloud
2. Import workflow
3. Configure credentials
4. Activate

### Self-Hosted
```bash
docker-compose up -d
```

See: https://docs.n8n.io/hosting/

---

## Performance

**Metrics (87 projects):**
- Execution time: ~2-3 minutes
- API calls: ~87 to Asana + 87 to your API
- Memory: ~200MB

**Optimization:**
- Use Google Sheet to limit projects
- Increase sync interval if needed
- Monitor n8n execution logs

---

## Support

**Common Issues:**
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)

**Need Help?**
- n8n Community: https://community.n8n.io
- Asana API Docs: https://developers.asana.com
