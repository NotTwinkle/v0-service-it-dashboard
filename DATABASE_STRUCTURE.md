# Database Structure Documentation
## `time_trackingv2` Database

**Last Updated:** Based on exploration via `/dashboard/database` interface

---

## 📊 Database Overview

- **Total Tables:** 16
- **Total Timelog Entries:** 8,296
- **Total Users:** 13
- **Total Projects:** 46

---

## 🔑 Key Tables

### 1. **`timelogs`** (8,296 rows)
**Primary Key:** `timelog_id`

**Columns:**
- `timelog_id` (int, PK) - Unique identifier
- `task` (text, nullable) - Task description
- `date` (date, NOT NULL) - Date of time entry
- `starttime` (time, nullable) - Start time
- `endtime` (time, nullable) - End time
- `company_id` (int, nullable) - FK to `company.company_id`
- `user_id` (int, NOT NULL) - FK to `users.user_id`
- `user_name` (varchar(255), nullable) - **Stored directly** (denormalized)
- `product_id` (int, nullable) - FK to `product.product_id`
- `status_id` (int, nullable) - FK to `status.status_id`
- `reference_number` (varchar(255), nullable)
- `duration` (float, nullable) - Stored hours
- `billable_id` (int, nullable) - FK to `billable.billable_id`
- `accomplishment` (text, nullable) - Notes/description
- `category` (int, nullable) - FK to `category.category_id`
- `subcategory` (int, nullable) - FK to `subcategory.subcategory_id`

**⚠️ IMPORTANT:**
- ❌ **NO `project_id` column**
- ❌ **NO `project_name` column**
- ❌ **NO direct relationship with `project` table**

**Relationships:**
- `user_id` → `users.user_id`
- `category` → `category.category_id`
- `subcategory` → `subcategory.subcategory_id`
- `company_id` → `company.company_id`
- `product_id` → `product.product_id`
- `status_id` → `status.status_id`
- `billable_id` → `billable.billable_id`

---

### 2. **`users`** (13 rows)
**Primary Key:** `user_id`

**Columns:**
- `user_id` (int, PK) - **Primary key** (NOT `id`)
- `name` (varchar(255), NOT NULL)
- `email` (varchar(255), NOT NULL)
- `password` (varchar(255), NOT NULL)
- `role` (varchar(255), NOT NULL)
- `inactive` (tinyint, NOT NULL)

**Sample Data:**
- User ID 6: Lance (lance.nunez@serviceitplus.com)
- User ID 7: Li (angelique.carrollo@serviceitplus.com)
- User ID 8: Michael Monteza (michael.monteza@serviceitplus.com)

---

### 3. **`project`** (46 rows)
**Primary Key:** `id`

**Columns:**
- `id` (int, PK) - Internal primary key
- `project_name` (varchar(250), NOT NULL) - Project name
- `project_id` (bigint, NOT NULL) - **Asana GID** (external identifier)

**Sample Data:**
- ID 75: "PSACC | Ivanti Implementation" (Asana GID: 1206838393848201)
- ID 76: "Landbank | Ivanti Implementation" (Asana GID: 1206884302399649)
- ID 77: "Customer Success" (Asana GID: 1207073978614428)

**⚠️ IMPORTANT:**
- `project.id` is the **internal primary key**
- `project.project_id` is the **Asana GID** (external ID)
- **NO foreign key from `timelogs` to `project`**
- Projects are stored separately and not linked to timelogs

---

### 4. **`category`** (8 rows)
**Primary Key:** `category_id`

**Columns:**
- `category_id` (int, PK)
- `category_name` (varchar(255), nullable)
- `is_deleted` (int, nullable)

**Relationship:**
- `timelogs.category` → `category.category_id`

---

### 5. **`subcategory`** (110 rows)
**Primary Key:** `subcategory_id`

**Columns:**
- `subcategory_id` (int, PK)
- `subcategory_name` (varchar(255), nullable)
- `category_id` (int, nullable) - FK to `category.category_id`
- `is_deleted` (int, nullable)

**Relationship:**
- `timelogs.subcategory` → `subcategory.subcategory_id`
- `subcategory.category_id` → `category.category_id`

---

### 6. **`company`** (39 rows)
**Primary Key:** `company_id`

**Columns:**
- `company_id` (int, PK)
- `company_name` (varchar(255), NOT NULL)
- `email` (varchar(255), nullable)
- `inactive` (tinyint, nullable)

**Relationship:**
- `timelogs.company_id` → `company.company_id`

---

### 7. **`product`** (34 rows)
**Primary Key:** `product_id`

**Columns:**
- `product_id` (int, PK)
- `product_name` (varchar(255), NOT NULL)
- `inactive` (tinyint, NOT NULL)

**Relationship:**
- `timelogs.product_id` → `product.product_id`

---

### 8. **`status`** (3 rows)
**Primary Key:** `status_id`

**Columns:**
- `status_id` (int, PK)
- `status_name` (varchar(255), NOT NULL)
- `inactive` (tinyint, NOT NULL)

**Relationship:**
- `timelogs.status_id` → `status.status_id`

---

### 9. **`billable`** (2 rows)
**Primary Key:** `billable_id`

**Columns:**
- `billable_id` (int, PK)
- `billable_name` (varchar(255), nullable)
- `inactive` (tinyint, nullable)

**Relationship:**
- `timelogs.billable_id` → `billable.billable_id`

---

### 10. **`activities`** (18 rows)
**Primary Key:** `activity_id`

**Columns:**
- `activity_id` (int, PK)
- `activity_name` (varchar(255), NOT NULL)
- `inactive` (tinyint, NOT NULL)
- `chargeable` (varchar(255), nullable)
- `internal` (varchar(255), nullable)

**Note:** Not directly used in timelogs (separate activity tracking)

---

## 📋 Views

### **`vw_timelogs`** (8,296 rows - same as timelogs)
**Purpose:** Pre-joined view of timelogs with related names

**Columns:**
- All timelogs columns
- `category_name` (from category table)
- `subcategory_name` (from subcategory table)
- `company_name` (from company table)
- `product_name` (from product table)
- `status_name` (from status table)
- `billable_name` (from billable table)
- `week_number` (calculated)
- `DATE` (aliased from `date`)

**⚠️ Still NO project_name or project_id**

---

### **`vw_timelogs_2`** (8,296 rows)
**Purpose:** Similar to vw_timelogs with additional date calculations

**Additional Columns:**
- `log_date` (aliased from date)
- `month_name` (calculated)
- `year` (calculated)
- `short_user_name` (calculated)

---

## 🔗 Relationship Summary

### ✅ **Working Relationships:**
1. `timelogs.user_id` → `users.user_id` ✅
2. `timelogs.category` → `category.category_id` ✅
3. `timelogs.subcategory` → `subcategory.subcategory_id` ✅
4. `timelogs.company_id` → `company.company_id` ✅
5. `timelogs.product_id` → `product.product_id` ✅
6. `timelogs.status_id` → `status.status_id` ✅
7. `timelogs.billable_id` → `billable.billable_id` ✅
8. `subcategory.category_id` → `category.category_id` ✅

### ❌ **Missing Relationships:**
1. `timelogs` → `project` - **NO relationship exists**
   - No `project_id` in timelogs
   - No `project_name` in timelogs
   - Projects are stored separately with no link

---

## 💡 Key Insights

### **How Timelogs Work:**
1. **Time entries** are stored in `timelogs` table
2. Each entry has:
   - User (via `user_id` + `user_name` stored directly)
   - Category/Subcategory (for activity type)
   - Company (client)
   - Product (service/product)
   - Status (work status)
   - Task description (free text)
   - **NO project association**

### **How Projects Work:**
1. **Projects** are stored in `project` table separately
2. Projects have:
   - Internal `id` (primary key)
   - `project_name` (display name)
   - `project_id` (Asana GID - external identifier)
3. **Projects are NOT linked to timelogs** - they exist independently

### **How to Match Projects with Timelogs:**
Since there's no direct relationship, matching must be done by:
1. **Task name matching** - Compare `timelogs.task` with project names
2. **Company matching** - Use `timelogs.company_id` to infer project
3. **Manual association** - Would require adding a `project_id` column to timelogs

---

## 🚨 Common Errors & Solutions

### Error: `Unknown column 't.project_id' in 'ON'`
**Cause:** Trying to JOIN timelogs with project using non-existent column
**Solution:** Don't use `t.project_id` - it doesn't exist. Use task/company matching instead.

### Error: `Unknown column 'u.id' in 'ON'`
**Cause:** Users table uses `user_id` as PK, not `id`
**Solution:** Use `u.user_id` instead of `u.id`

### Error: `Unknown column 't.project_name' in 'SELECT'`
**Cause:** Timelogs has no project_name column
**Solution:** Don't select `t.project_name` - use NULL or join via other means

---

## 📝 Sample Data Patterns

### Timelog Entry Example:
```json
{
  "timelog_id": 1,
  "task": "Lead Devotion",
  "date": "2025-03-11",
  "starttime": "08:30:00",
  "endtime": "09:00:00",
  "user_id": 16,
  "user_name": "timothy.campos@serviceitplus.com",
  "company_id": 1,
  "product_id": 47,
  "status_id": 8,
  "category": 4,
  "subcategory": 67,
  "duration": 0.5
}
```

### Project Entry Example:
```json
{
  "id": 75,
  "project_name": "PSACC | Ivanti Implementation",
  "project_id": 1206838393848201
}
```

---

## 🎯 Recommendations

1. **For Personal Dashboard:**
   - Use `timelogs` directly with `user_id` filter
   - Join with `users`, `category`, `subcategory` for names
   - Don't try to join with `project` - no relationship exists

2. **For Project Matching:**
   - If needed, match by `task` field containing project name
   - Or match by `company_id` if projects are company-specific
   - Consider adding `project_id` column to timelogs if project tracking is needed

3. **For Asana Integration:**
   - Use `project.project_id` (Asana GID) to match with Asana API
   - Calculate estimated hours from Asana tasks
   - Actual hours come from timelogs (but can't match by project directly)

---

## 📊 Statistics

- **Total Timelogs:** 8,296 entries
- **Total Users:** 13 users
- **Total Projects:** 46 projects (Asana-linked)
- **Total Categories:** 8 categories
- **Total Subcategories:** 110 subcategories
- **Total Companies:** 39 companies
- **Total Products:** 34 products
- **Audit Trail:** 18,799,965 audit records (timelogs_audit)

---

**Generated from:** `/dashboard/database` interface exploration
**Date:** 2025-01-XX
