# Troubleshooting: Project ID Error in Get Asana Project Details

## Error: "Project ID is required" or Red Highlight

This happens when the Project ID field can't find the data from the Google Sheets node.

---

## Quick Fix Steps

### 1. Execute Google Sheets Node First ⚠️ IMPORTANT

**You MUST run the Google Sheets node before the Asana node can work!**

1. Click on **"Read Google Sheet Project List"** node
2. Click **"Execute Node"** button
3. Check the OUTPUT - you should see rows with project IDs
4. **Look at the column names** in the output (first item)

**Example output:**
```json
[
  {
    "Project ID": "1206838393848201",
    "Project Name": "PSACC | IT Service and Asset Management"
  }
]
```

### 2. Check Column Name

After executing Google Sheets node, check what the column is actually called:

- `Project ID` ✅ (most likely)
- `project_id` 
- `PROJECT ID`
- `A` (if no headers)
- `0` (index-based)

### 3. Update Project ID Field

In **"Get Asana Project Details"** node, set Project ID to match the actual column name:

**Option A: If column name is "Project ID"**
```
={{ $json['Project ID'] }}
```

**Option B: If using first column (no headers)**
```
={{ $json[0] }}
```

**Option C: Try column A directly**
```
={{ $json.A }}
```

**Option D: Case-insensitive search (works with any variation)**
```
={{ $json['Project ID'] || $json['project_id'] || $json['PROJECT ID'] || $json[0] || $json.A }}
```

---

## Common Issues

### Issue 1: "No input data"

**Cause:** Google Sheets node hasn't been executed yet.

**Solution:**
1. Execute "Read Google Sheet Project List" node first
2. Wait for it to complete
3. Then the Asana node will have data

---

### Issue 2: Column name doesn't match

**Cause:** Google Sheets returns columns with different names than expected.

**Solution:**
1. Execute Google Sheets node
2. Look at OUTPUT to see actual column names
3. Update Project ID field to match exactly (case-sensitive!)

**How to find column name:**
- In Google Sheets node output, expand first item
- Look at the JSON keys (property names)
- Use that exact name in `{{ $json['Column Name'] }}`

---

### Issue 3: First row is not headers

**Cause:** Google Sheets might treat first row as data, not headers.

**Solution:**
1. Make sure first row in sheet has headers: "Project ID", "Project Name"
2. Or use index-based access: `={{ $json[0] }}` for column A

---

### Issue 4: Range doesn't include headers

**Cause:** Range starts at A2 (skipping header row A1).

**Solution:**
- Current range: `A2:B100` (starts at row 2)
- If headers are in row 1, n8n might not detect them
- **Try:** Use `A1:B100` to include header row, then n8n will auto-detect column names

---

## Testing

### Test Google Sheets Node
1. Open "Read Google Sheet Project List"
2. Click "Execute Node"
3. **Expected:** List of items with Project IDs
4. **Check:** Expand first item to see column names

### Test Full Workflow
1. Click "Execute Workflow" (not just one node)
2. n8n will execute all nodes in sequence
3. Check each node turns green
4. If any node fails, check the error message

---

## Debugging Tips

### See Actual Column Names
1. Execute Google Sheets node
2. In OUTPUT, click first item
3. Look at the JSON structure
4. Note the exact property names (these are your column names)

**Example:**
```json
{
  "Project ID": "1206838393848201",  ← This is the column name to use
  "Project Name": "PSACC..."
}
```

### Use Expression Editor
1. In Project ID field, click the `</>` button (code view)
2. Try different expressions:
   - `{{ $json['Project ID'] }}`
   - `{{ $json[0] }}`
   - `{{ $json.A }}`
3. Test each one

---

## Best Practice

**Use explicit column names:**

1. Make sure Google Sheet has headers in row 1:
   - Column A: "Project ID"
   - Column B: "Project Name"

2. In Google Sheets node, use range starting at row 2:
   - Range: `A2:B100` (skips header, starts at data)

3. Or include headers in range:
   - Range: `A1:B100` (includes header, n8n auto-detects)

4. In Asana node, use:
   ```
   {{ $json['Project ID'] }}
   ```

---

## Alternative: Use Code Node

If Project ID field keeps having issues, use a Code node to extract it:

```javascript
// Between Google Sheets and Asana nodes
const items = $input.all();
return items.map(item => {
  return {
    json: {
      project_id: item.json['Project ID'] || item.json[0] || item.json.A,
      // Keep original data
      ...item.json
    }
  };
});
```

Then in Asana node use: `={{ $json.project_id }}`

---

## Still Having Issues?

1. **Share the OUTPUT** from Google Sheets node
2. **Check the column names** in that output
3. **Verify sheet has headers** in row 1
4. **Try the alternative expressions** above
