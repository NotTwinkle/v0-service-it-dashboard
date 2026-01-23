# Why Only 1 Project Shows (18092 Hours from 4523 Tasks)

## The Problem

The workflow is aggregating ALL tasks from ALL 87 projects into ONE result instead of processing each project separately.

**What's happening:**
- Google Sheets returns 87 projects
- n8n loops through each project
- BUT: The "Calculate Estimated Hours" node is seeing tasks from ALL iterations at once
- Result: 1 massive aggregated result (4523 total tasks, 18092 hours)

---

## The Root Cause

In n8n, when nodes loop, each node should process items individually. However, the "Calculate Estimated Hours" Code node uses `$input.all()` which in some contexts can aggregate results across all loop iterations.

---

## Solution: Enable "Execute Once" Mode

n8n nodes have execution modes:

1. **Execute for Each Item** (default) - Runs once per input item
2. **Execute Once for All Items** - Runs once with all items

The issue is that some nodes are batching results instead of processing one at a time.

---

## How to Fix in n8n UI

### Option 1: Check Node Execution Settings

For each Asana node and Code node:

1. Click on the node
2. Go to **Settings** tab (next to Parameters)
3. Look for "Execute Once"
4. **DISABLE** "Execute Once" (uncheck it)
5. This makes the node run separately for each item

### Option 2: Add a Split In Batches Node

Insert a "Split In Batches" node after "Read Google Sheet":

```
Read Google Sheet 
  ↓
Split In Batches (batch size: 1)
  ↓
Get Asana Project Details
  ↓
Get Project Tasks
  ↓
Calculate Estimated Hours
  ↓
Send to Dashboard API
```

**Split In Batches settings:**
- Batch Size: 1
- Options: Reset after completion

This forces one project to be fully processed before moving to the next.

---

## Option 3: Rewrite Calculate Hours Code

Update the Code node to handle batched execution properly:

```javascript
// Process ONE project at a time
// Get the current project from upstream
const projectNode = $('Get Asana Project Details');
const currentProject = projectNode.item.json; // Use .item not .first()

// Get tasks for THIS project only
const tasksNode = $('Get Project Tasks');
const tasks = tasksNode.all(); // These should be from current project only

const projectGid = currentProject.gid;
const projectName = currentProject.name;

let totalEstimated = 0;
let completedTasks = 0;

tasks.forEach(task => {
  const t = task.json;
  
  if (t.completed) completedTasks++;
  
  // Look for estimated hours in custom fields
  if (t.custom_fields && Array.isArray(t.custom_fields)) {
    const hoursField = t.custom_fields.find(f => 
      f.name && (f.name.toLowerCase().includes('hour') || f.name.toLowerCase().includes('estimate'))
    );
    
    if (hoursField && hoursField.number_value) {
      totalEstimated += parseFloat(hoursField.number_value);
    } else {
      totalEstimated += 4; // Default 4 hours per task
    }
  } else {
    totalEstimated += 4;
  }
});

return [{
  json: {
    asana_project_gid: projectGid,
    asana_project_name: projectName,
    estimated_hours: totalEstimated,
    total_tasks: tasks.length,
    completed_tasks: completedTasks
  }
}];
```

---

## Expected Result

After fixing, you should see:

**87 separate webhook calls** to your dashboard API, each with:
```json
{
  "asana_project_gid": "1206838393848201",
  "asana_project_name": "PSACC | IT Service and Asset Management",
  "estimated_hours": 120.5,
  "total_tasks": 24,
  "completed_tasks": 18
}
```

Instead of ONE call with 18092 hours.

---

## Debugging Steps

### 1. Check Execution Log

In n8n:
1. Go to "Executions" tab
2. Find your workflow run
3. Look at how many times "Send to Dashboard API" executed
4. Should be 87 times (once per project)

### 2. Add a Debug Node

Insert a "Set" or "No Op" node between each step to see the data flow:

```
Get Project Tasks
  ↓
DEBUG: Set Node (name it "Debug Tasks Count")
  ↓
Calculate Estimated Hours
```

In the Debug node, add a field:
- Name: `task_count`
- Value: `={{ $input.all().length }}`

This shows how many tasks are being processed at each step.

### 3. Check Each Node's Output

Click on each node after execution and check:
- How many output items it produced
- Whether it's outputting 1 item (good) or 87 items (batched)

---

## Recommended Fix: Split In Batches

The cleanest solution is adding a "Split In Batches" node:

### Updated Workflow:

1. Schedule Trigger
2. Read Google Sheet (87 items)
3. **Split In Batches** (batch size: 1) ← ADD THIS
4. Get Asana Project Details (processes 1 at a time)
5. Get Project Tasks
6. Calculate Estimated Hours
7. Send to Dashboard API
8. **Loop Back to Split In Batches** (n8n does this automatically)

This guarantees ONE project is fully processed before moving to the next.

---

## Quick Test

After fixing:

1. Limit Google Sheets to 3 projects first:
   - Change range to `A2:A4` (only 3 projects)
2. Run workflow
3. Check you get 3 separate results
4. Then change back to `A2:B100`
