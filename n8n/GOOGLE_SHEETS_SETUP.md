# Google Sheets Integration Setup

## Overview

This workflow uses your Google Sheet as the **source of truth** for which Asana projects to track. This is much better than fetching all 100+ projects!

**Google Sheet:** https://docs.google.com/spreadsheets/d/1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4/edit?usp=sharing

---

## How It Works

```
1. Read Google Sheet (Column A: Project IDs)
   ↓
2. For each Project ID → Get Asana Project Details
   ↓
3. Get Tasks for that Project
   ↓
4. Calculate Estimated Hours
   ↓
5. Send to Dashboard API
```

**Benefits:**
- Only syncs projects you care about (no archived/test projects)
- Google Sheet acts as project filter
- Easy to add/remove projects (just edit the sheet)
- Faster sync (fewer projects to process)

---

## Setup Instructions

### Step 1: Set Up Google Sheets API in n8n

1. **In n8n UI**, go to **Credentials**
2. Click **Add Credential**
3. Select **Google Sheets OAuth2 API**
4. Click **Connect My Account**
5. Sign in with your Google account
6. Grant permissions to n8n
7. Save as "Google Sheets OAuth2"

---

### Step 2: Import the Updated Workflow

1. In n8n, import the workflow: `n8n/workflows/asana-project-sync-webhook.json`
2. Verify these nodes are connected:
   - Schedule Trigger → Read Google Sheet → Get Asana Project Details → Get Project Tasks → Calculate Hours → Send to API

---

### Step 3: Configure the Google Sheets Node

The workflow is already configured to read from your sheet, but verify:

1. **Open "Read Google Sheet Project List" node**
2. **Settings:**
   - **Operation:** Read
   - **Document ID:** `1uYHGyAi0a2GriocwAl3FD3OI3w4pUqXqGNLLKrwq-w4` (already set)
   - **Sheet Name:** `Sheet1` (or whatever your sheet is named)
   - **Range:** `A2:B100` (reads Project ID and Project Name columns)
   - **Credential:** Select your Google Sheets OAuth2 credential

3. **Test it:**
   - Click "Execute Node"
   - Should see all project IDs from your sheet

---

### Step 4: Configure Asana Nodes

1. **Get Asana Project Details node:**
   - Uses `={{ $json['Project ID'] }}` to get project ID from sheet
   - Select your Asana credential

2. **Get Project Tasks node:**
   - Already configured with `filters.project`
   - Select your Asana credential

---

### Step 5: Test the Complete Workflow

1. Click **"Execute Workflow"** in n8n
2. Watch each node execute:
   - ✅ Read Google Sheet (should show ~87 projects)
   - ✅ Get Asana Project Details (loops for each project)
   - ✅ Get Project Tasks (gets tasks for each project)
   - ✅ Calculate Estimated Hours
   - ✅ Send to Dashboard API

3. Check your dashboard at `/dashboard/variance`

---

## Google Sheet Format

Your sheet should have this format:

| Column A (Project ID) | Column B (Project Name)                              |
|-----------------------|------------------------------------------------------|
| 1206838393848201      | PSACC \| IT Service and Asset Management            |
| 1206884302399649      | Landbank \| Ivanti Implementation                   |
| 1207146854352296      | Project Boost                                        |
| ...                   | ...                                                  |

**Important:**
- Column A = Asana Project ID (required)
- Column B = Project Name (optional, for reference)
- Header row is skipped (range starts at A2)

---

## How to Add/Remove Projects

### Add a Project:
1. Open Google Sheet
2. Add new row with Asana Project ID in column A
3. Wait for next sync (or run workflow manually)

### Remove a Project:
1. Delete the row from Google Sheet
2. Project will no longer be synced

### Find Asana Project ID:
1. Open project in Asana
2. Check the URL: `https://app.asana.com/0/PROJECT_ID/...`
3. Or use the n8n workflow output from "Get All Projects"

---

## Troubleshooting

### Error: "Insufficient Permission"
- **Solution:** Re-authenticate Google Sheets OAuth2 in n8n credentials
- Make sure you have access to the Google Sheet

### Error: "Range not found"
- **Solution:** Check sheet name and range in the Google Sheets node
- Make sure sheet is named "Sheet1" or update the node

### Error: "Project not found in Asana"
- **Solution:** Verify Project ID is correct in Google Sheet
- Check if project was deleted or archived in Asana

### Projects Not Matching in Dashboard
- **Solution:** Ensure project names in time tracker are similar to Asana names
- Check fuzzy matching confidence in API response

---

## Performance

**With Google Sheet Filter:**
- Syncs only ~87 projects (instead of 100+)
- Skips archived/test projects
- Faster execution (~2-3 minutes vs 5-10 minutes)
- Less API calls to Asana

**Recommended Sync Frequency:**
- Every 6 hours (default)
- Or daily if projects don't change often
- Manual trigger when you add new projects to sheet

---

## Advanced: Auto-Populate Sheet from Asana

If you want to automatically populate the Google Sheet with Asana projects:

1. Create a separate workflow:
   - Get All Asana Projects
   - Filter active projects only
   - Write to Google Sheet (Append or Update)

2. Run once to populate, then use the main workflow for syncing

---

## Maintenance

**Weekly:**
- Review Google Sheet for outdated projects
- Remove completed/archived projects

**Monthly:**
- Audit project IDs in sheet vs Asana
- Check for any sync failures in n8n logs

---

**You're all set!** The workflow will now only sync projects listed in your Google Sheet, making it much more efficient and manageable.
