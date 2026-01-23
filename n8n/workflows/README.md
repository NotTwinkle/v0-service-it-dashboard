# n8n Workflow Documentation

## asana-project-sync-webhook.json

### Purpose
Syncs Asana project data with your time tracker dashboard every 6 hours.

### Workflow Diagram

```
┌─────────────────────┐
│ Schedule Trigger    │
│ (Every 6 hours)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Get All Projects    │
│ from Asana API      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Filter Active Only  │
│ (exclude archived)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Get Project Tasks   │
│ from Asana API      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Calculate Estimated │
│ Hours (JS Code)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Send to Dashboard   │
│ Webhook API         │
└─────────────────────┘
```

### Node Descriptions

#### 1. Schedule Every 6 Hours
- **Type:** Schedule Trigger
- **Interval:** 6 hours
- **Purpose:** Automatically triggers the workflow
- **Configurable:** Yes, change interval in node settings

#### 2. Get All Asana Projects
- **Type:** Asana API
- **Resource:** project
- **Operation:** getAll
- **Fields:** name, gid, permalink_url, archived
- **Authentication:** Asana Personal Access Token
- **Output:** Array of projects

#### 3. Filter Active Projects
- **Type:** IF Node
- **Condition:** archived === false
- **Purpose:** Exclude archived/completed projects
- **Output:** Only active projects

#### 4. Get Project Tasks
- **Type:** Asana API
- **Resource:** task
- **Operation:** getAll
- **Project ID:** From previous node
- **Fields:** name, gid, completed, custom_fields
- **Purpose:** Get all tasks to calculate estimates

#### 5: Calculate Estimated Hours
- **Type:** Code (JavaScript)
- **Input:** Array of tasks from Asana
- **Logic:**
  - Loops through all tasks
  - Looks for "Estimated Hours" custom field
  - Sums up estimated hours
  - Defaults to 4 hours per task if no custom field
  - Counts total and completed tasks
- **Output:** 
```json
{
  "asana_project_gid": "1234567890",
  "asana_project_name": "Mobile App Redesign",
  "estimated_hours": 120.5,
  "total_tasks": 24,
  "completed_tasks": 18
}
```

#### 6. Send to Dashboard API
- **Type:** HTTP Request
- **Method:** POST
- **URL:** From environment variable (API_WEBHOOK_URL)
- **Body:** Project data with estimates
- **Purpose:** Send data to your Next.js dashboard
- **Expected Response:**
```json
{
  "success": true,
  "matched": true,
  "local_project": { "project_id": 75, "project_name": "..." },
  "confidence": 0.95
}
```

---

### Customization Options

#### Change Sync Frequency
Edit "Schedule Every 6 Hours" node:
- Every 1 hour: Set hoursInterval to 1
- Every 12 hours: Set hoursInterval to 12
- Daily: Change field to "days", set to 1
- On webhook: Replace with Webhook Trigger node

#### Customize Estimated Hours Calculation
Edit the JavaScript code in "Calculate Estimated Hours" node:
```javascript
// Example: Use different custom field names
const estimatedField = taskJson.custom_fields.find(
  field => field.name === 'Story Points' || field.name === 'Effort'
);

// Example: Different default hours
totalEstimatedHours += 8; // 8 hours instead of 4
```

#### Add Filtering Logic
Add an IF node after "Get All Asana Projects":
- Filter by team
- Filter by tag
- Filter by name pattern

---

### Error Handling

The workflow includes automatic error handling:
- Retries failed API calls (3 times)
- Continues to next project if one fails
- Logs errors to n8n execution log

To view errors:
1. Go to "Executions" in n8n
2. Click on failed execution
3. View error details for each node

---

### Performance Optimization

**For many projects (100+):**
1. Add "Split In Batches" node after "Get All Asana Projects"
2. Process 10 projects at a time
3. Add delay between batches (1 second)

**For large projects (1000+ tasks):**
1. Add pagination to "Get Project Tasks"
2. Limit to 200 tasks per request
3. Sum estimates across all pages

---

### Testing

**Manual Test:**
1. Click "Execute Workflow" button
2. Watch each node turn green
3. Check "Send to Dashboard API" response
4. Verify data in dashboard: `/dashboard/variance`

**Scheduled Test:**
1. Set schedule to every 1 minute
2. Let it run once
3. Check execution history
4. Change back to 6 hours

---

### Monitoring

Add monitoring nodes:
1. **On Success:** Send notification (Email, Slack, Discord)
2. **On Error:** Alert via webhook
3. **Logging:** Send execution data to logging service

Example: Add after "Send to Dashboard API":
```json
{
  "name": "Notify Success",
  "type": "n8n-nodes-base.slack",
  "parameters": {
    "channel": "#time-tracker-sync",
    "text": "✅ Synced {{ $json.total_projects }} projects from Asana"
  }
}
```
