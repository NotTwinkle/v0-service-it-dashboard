# Google Sheets as Database Approach

## Overview

This is a **much better approach** than the webhook method! Here's why:

### Problems with Old Approach
- ❌ n8n had to process 102 projects every time
- ❌ Slow execution (5-10 minutes)
- ❌ 102 API calls to your dashboard
- ❌ Data stored in memory (lost on restart)

### New Approach Benefits
- ✅ Google Sheets is the database
- ✅ n8n runs once per day to update the sheet
- ✅ Dashboard reads from Google Sheets (instant)
- ✅ Data persists in the sheet
- ✅ You can manually edit/review in Google Sheets
- ✅ No repeated Asana API calls

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: n8n Updates Sheet (Once per day)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  n8n Workflow (Daily):                                       │
│    Read Sheet → Get Asana Project → Get Tasks →             │
│    Calculate Hours → Write Back to Sheet                     │
│                                                               │
│  Google Sheet now has:                                       │
│  - Project ID                                                │
│  - Project Name                                              │
│  - Company Name                                              │
│  - Estimated Hours (from Asana)                              │
│  - Total Tasks                                               │
│  - Completed Tasks                                           │
│  - Last Synced                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Step 2: Dashboard Reads from Sheet (Anytime, instant)      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Dashboard API:                                              │
│    Read Google Sheet → Match with Time Tracker →            │
│    Calculate Variance → Display                              │
│                                                               │
│  No n8n needed at runtime!                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Instructions

### Step 1: Add Columns to Your Google Sheet

Add these columns to your sheet (after Company Name):
- **Column D:** `Estimated Hours` (number)
- **Column E:** `Total Tasks` (number)
- **Column F:** `Completed Tasks` (number)
- **Column G:** `Last Synced` (date)

### Step 2: Import n8n Workflow

1. Open n8n
2. Import `n8n/workflows/asana-to-sheets-sync.json`
3. Configure:
   - Google Sheets credential
   - Asana credential
   - Document ID (already set: your sheet)
   - Sheet name: "Project"

### Step 3: Test the n8n Workflow

1. Click "Execute Workflow"
2. Watch it process each project
3. Check your Google Sheet - columns D, E, F, G should be populated
4. It processes ONE project at a time (n8n default behavior)

### Step 4: Access Dashboard

1. Go to `http://localhost:3000/dashboard/variance`
2. Click "Refresh"
3. Should see all 102 projects with variance data
4. Data loads instantly (from Google Sheets, not n8n)

---

## How It Works

### n8n Workflow (asana-to-sheets-sync.json)

**Nodes:**
1. **Schedule Daily** - Runs once per day at midnight
2. **Read Project Sheet** - Gets all 102 projects
3. **Get Asana Project** - Gets project details (runs for each row)
4. **Get Project Tasks** - Gets all tasks for that project
5. **Calculate Estimated Hours** - Sums up estimated hours from custom fields
6. **Update Sheet** - Writes estimated hours back to the same row

**Process:**
- For each project in your sheet
- Fetch tasks from Asana
- Calculate estimated hours
- Write back to columns D, E, F, G
- Move to next project

### Dashboard API (GET /api/sheets/projects)

**Process:**
1. Read Google Sheets using public API (no auth needed for public sheets)
2. Get actual hours from `timelogs` table in your database
3. Match project names (fuzzy matching)
4. Calculate variance: `estimated - actual`
5. Return to dashboard

---

## Google Sheets Columns

| Column | Name | Type | Source | Description |
|--------|------|------|--------|-------------|
| A | Project ID | Text | Manual | Asana project GID |
| B | Project Name | Text | Manual | Asana project name |
| C | Company Name | Text | Manual | Client/company name |
| D | Estimated Hours | Number | **n8n** | Calculated from Asana tasks |
| E | Total Tasks | Number | **n8n** | Count of tasks in project |
| F | Completed Tasks | Number | **n8n** | Count of completed tasks |
| G | Last Synced | Date | **n8n** | When n8n last updated this row |

---

## Workflow Schedule

**Default:** Once per day (midnight)

**To change frequency:**

Edit "Schedule Daily" node in n8n:
- Every 12 hours: `hoursInterval: 12`
- Every 6 hours: `hoursInterval: 6`
- Once per week: `daysInterval: 7`

**Recommendation:** Daily is enough, since Asana estimates don't change often.

---

## Manual Sync

To manually sync anytime:
1. Open n8n
2. Find "Asana to Google Sheets" workflow
3. Click "Execute Workflow"
4. Wait for completion (2-5 minutes for 102 projects)
5. Refresh your dashboard

---

## Advantages

### 1. Fast Dashboard Loading
- No waiting for n8n to process
- Instant data from Google Sheets
- Can refresh anytime

### 2. Data Persistence
- Data stored in Google Sheets
- Survives server restarts
- Historical data preserved

### 3. Manual Review
- Open Google Sheets to review
- Manually edit estimated hours if needed
- Add notes or comments

### 4. Less API Calls
- n8n runs once per day (not every page load)
- Asana API respects rate limits
- No repeated dashboard webhook calls

### 5. Scalability
- Works with 102 or 1000 projects
- Dashboard performance stays fast
- Only n8n sync time increases

---

## Troubleshooting

### Issue: Columns not updating in sheet

**Check:**
1. n8n workflow executed successfully?
2. Correct sheet name: "Project"?
3. Google Sheets credentials valid?
4. Column headers exist (D, E, F, G)?

**Fix:**
- Re-run workflow manually
- Check n8n execution log for errors

### Issue: Dashboard shows no data

**Check:**
1. Google Sheets is public or accessible?
2. Sheet ID correct in API: `1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4`?
3. Sheet name: "Project"?

**Fix:**
- Test API: `http://localhost:3000/api/sheets/projects`
- Check browser console for errors

### Issue: Projects not matching with time tracker

**Cause:** Project names don't match between Asana and time tracker.

**Fix:**
- Check `project_name` in `timelogs` table
- Compare with Asana project names
- Ensure similar naming (e.g., "PSACC | IT Service" vs "PSACC IT Service")

---

## Monitoring

### Check Last Sync Date
- Open Google Sheets
- Look at column G "Last Synced"
- Should be today's date if workflow ran

### Check n8n Execution Log
1. Open n8n
2. Go to "Executions" tab
3. Find latest run
4. Check for errors or warnings

### Check Dashboard Summary
- Dashboard shows "projects_with_asana_data"
- Should be close to 102 if all synced

---

## Next Steps

1. **Add columns D-G to your Google Sheet**
2. **Import the n8n workflow**
3. **Run it once manually to populate data**
4. **Open dashboard to see variance**
5. **Set schedule to daily**

This approach is production-ready and scales well!
