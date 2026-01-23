# API Setup Guide

This guide explains how to set up the required API integrations for the dashboard.

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Asana API
ASANA_ACCESS_TOKEN=your_asana_personal_access_token

# Google Sheets API
GOOGLE_SHEETS_API_KEY=your_google_api_key

# Database (existing)
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=time_trackingv2
```

## 1. Asana API Setup

### Get Your Access Token:

1. Go to: https://app.asana.com/0/my_apps
2. Click **"+ Create new token"**
3. Give it a name (e.g., "Dashboard Integration")
4. Copy the token
5. Add to `.env.local`:
   ```
   ASANA_ACCESS_TOKEN=your_token_here
   ```

### What It Does:

- Fetches tasks for each project when you expand a project card
- Shows task names, assignees, completion status, and due dates

### API Endpoint Created:

```
GET /api/asana/projects/[gid]/tasks
```

## 2. Google Sheets API Setup

### Get Your API Key:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create a project (if you don't have one)
3. Click **"+ CREATE CREDENTIALS"** → **"API key"**
4. Copy the API key
5. Enable the **Google Sheets API**:
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Google Sheets API"
   - Click "Enable"
6. Add to `.env.local`:
   ```
   GOOGLE_SHEETS_API_KEY=your_api_key_here
   ```

### Make Your Sheet Public:

Your sheet must be accessible to "Anyone with the link (Viewer)":

1. Open your Google Sheet
2. Click **"Share"** (top right)
3. Click **"Change to anyone with the link"**
4. Set permission to **"Viewer"**
5. Copy the link

### Sheet Structure:

The **Support** tab should have these columns (column names are flexible):

- `Ticket Number` or `Incident` - The ticket/incident number
- `Company` or `Client` - Company name (must match Asana project name)
- `Actual Effort` or `Actual Hours` - Hours spent (numeric)
- `Status` - Ticket status
- `Description` or `Summary` - Task description

### What It Does:

- Fetches support tickets from Google Sheets
- Groups tickets by ticket number
- Sums "actual effort" for multiple tasks under same ticket
- Matches tickets to projects by company name
- Shows top 3 tickets per project

### API Endpoint Created:

```
GET /api/sheets/support
```

## How It Works

### When You Expand a Project:

1. **Asana Tasks**: Fetches from `/api/asana/projects/[gid]/tasks`
   - Shows up to 10 tasks
   - Displays assignee, due date, completion status

2. **Support Tickets**: Filters from `/api/sheets/support`
   - Extracts company name from project title (format: `Year - Company - Product`)
   - Matches tickets by company name
   - Shows top 3 tickets by actual effort
   - Displays ticket number, total hours, task breakdown

### Project Name Format:

Projects must follow this format: `2026 - Company Name - Product Name`

Example: `2026 - Cyber Battalion - Trellix Email Security`

The company name ("Cyber Battalion") is used to match support tickets.

## Testing

### 1. Test Asana Integration:

```bash
curl http://localhost:3000/api/asana/projects/[PROJECT_GID]/tasks
```

### 2. Test Google Sheets Integration:

```bash
curl http://localhost:3000/api/sheets/support
```

### 3. Test on Dashboard:

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/dashboard
3. Click on any project to expand
4. You should see:
   - Asana tasks listed
   - Support tickets (if company name matches)

## Troubleshooting

### Asana API Errors:

- **401 Unauthorized**: Check your `ASANA_ACCESS_TOKEN`
- **404 Not Found**: Project GID doesn't exist
- **No tasks showing**: Project might have no tasks

### Google Sheets API Errors:

- **403 Forbidden**: 
  - Check your API key
  - Make sure Google Sheets API is enabled
  - Verify sheet is shared publicly
- **404 Not Found**: Check the sheet ID and tab name ("Support")
- **No tickets showing**: 
  - Check column names in sheet
  - Verify company name matches project name
  - Check "Actual Effort" column has numeric values

### Company Name Matching:

If support tickets aren't showing:

1. Check your project name format: `2026 - Company - Product`
2. Check the "Company" column in Google Sheets
3. Make sure names match (case-insensitive, but spelling must match)

Example:
- Project: `2026 - Cyber Battalion - Trellix Email Security`
- Sheet Company: `Cyber Battalion` ✅
- Sheet Company: `CyberBattalion` ❌ (no space)

## API Response Examples

### Asana Tasks API:

```json
{
  "success": true,
  "project_gid": "1212760525764269",
  "tasks": [
    {
      "gid": "1234567890",
      "name": "Setup email gateway",
      "completed": false,
      "assignee": "John Doe",
      "due_on": "2026-02-15",
      "created_at": "2026-01-10T10:00:00.000Z"
    }
  ],
  "total": 5,
  "completed": 2,
  "incomplete": 3
}
```

### Google Sheets Support API:

```json
{
  "success": true,
  "tickets": [
    {
      "ticket_number": "INC-001",
      "company": "Cyber Battalion",
      "actual_effort": 8.0,
      "status": "Closed",
      "task_count": 3,
      "tasks": [
        { "description": "Initial investigation", "actual_effort": 3 },
        { "description": "Configuration", "actual_effort": 2 },
        { "description": "Testing", "actual_effort": 3 }
      ]
    }
  ],
  "total": 5,
  "total_effort": 25.5
}
```

## Next Steps

After setup:

1. Add your environment variables
2. Restart the dev server
3. Test the dashboard
4. Verify data is loading correctly
5. Check company name matching for support tickets

Need help? Check the console logs for detailed error messages.
