# Service IT+ Dashboard - Project Description

## Project Overview

**Service IT+ Dashboard** is a unified task and time management platform designed to consolidate work from multiple enterprise tools into a single source of truth. It helps teams track time, balance workloads, and gain actionable insights through advanced reconciliation analytics.

## Core Purpose

The platform solves the problem of fragmented work management by integrating:
- **Asana** - Project management and task tracking
- **Ivanti ITSM** - IT service management and ticketing
- **Google Sheets** - Support ticket tracking and data
- **Native Time Tracker** - Internal time logging and approvals

## Key Features

### 1. **Unified Task Management**
- Aggregates tasks from Asana projects, Ivanti tickets, and internal trackers
- Provides a single, prioritized view across all platforms
- Shows task details, assignees, due dates, and completion status
- Organizes tasks by project sections and categories

### 2. **Advanced Time Tracking & Reconciliation**
- Real-time time logging directly against tasks
- Automatic calculation of daily compliance metrics
- Time reconciliation between platforms (e.g., comparing Ivanti logged time vs Time Tracker)
- Surfaces gaps and discrepancies before they become issues
- Tracks estimated hours vs actual hours (variance tracking)

### 3. **Project Variance Analytics**
- Tracks estimated hours vs actual hours per project
- Identifies projects over/under budget
- Shows variance distribution across all projects
- Displays contributor counts and time entry statistics
- Filters and sorts projects by variance, status, or name

### 4. **Multi-Platform Integration**
- **Asana Integration**: Fetches projects, tasks, sections, and task details
- **Ivanti Integration**: Pulls ITSM tickets and support data
- **Google Sheets Integration**: Reads support tickets with actual effort tracking
- **Time Tracker**: Native time logging with approval workflows

### 5. **Smart Analytics & Reporting**
- Real-time dashboard with live overview metrics
- Project status distribution charts
- Time compliance tracking (target vs actual)
- Workload balancing insights
- Support ticket aggregation by company/project

### 6. **Enterprise-Ready Controls**
- User authentication and role-based access
- Secure API integrations
- Data reconciliation and audit capabilities
- Compliance tracking and reporting

## Target Users

- **Service IT+ Team Members**: Engineers, developers, and technical staff tracking time
- **Project Managers**: Managing multiple projects across different platforms
- **Team Leads**: Balancing workloads and ensuring compliance
- **Administrators**: Overseeing time tracking and project variance

## Value Proposition

1. **Single Source of Truth**: Consolidate all work from Asana, Ivanti, and Google Sheets in one place
2. **Time Reconciliation**: Close the loop by comparing time logged across platforms
3. **Actionable Insights**: Surface gaps and discrepancies before they become issues
4. **Workload Balance**: Understand how time is distributed across platforms and projects
5. **Compliance Tracking**: Auto-calculate daily compliance and track against targets
6. **Enterprise Controls**: Secure, scalable platform with proper authentication and data management

## Technical Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Database**: MySQL (time_trackingv2)
- **APIs**: Asana API, Google Sheets API, Ivanti ITSM
- **Authentication**: Custom auth with bcrypt
- **Deployment**: Vercel

## Key Metrics Tracked

- Total estimated hours (from Asana projects)
- Total actual hours (from Time Tracker)
- Variance (estimated vs actual)
- Project compliance percentage
- Open tasks count
- Support ticket effort
- Time reconciliation alerts
- Contributor statistics

## Use Cases

1. **Project Variance Tracking**: Monitor if projects are on track, over budget, or under budget
2. **Time Reconciliation**: Identify discrepancies between time logged in Ivanti vs Time Tracker
3. **Task Management**: View all tasks from Asana projects organized by sections
4. **Support Ticket Tracking**: See top support tickets per project with actual effort
5. **Compliance Monitoring**: Track daily time compliance against targets
6. **Workload Analysis**: Understand time distribution across platforms and projects

## Brand Identity

- **Primary Colors**: Orange gradient (#f16a21 to #f79021)
- **Secondary Colors**: Deep blue (#2d307a), Gray (#404040, #979897)
- **Brand Name**: Service IT+
- **Tone**: Professional, enterprise-focused, data-driven, actionable

---

## Hero Header Improvement Prompt

Use this description to create an improved hero header that:
- Clearly communicates the unified platform value proposition
- Highlights the multi-platform integration capability
- Emphasizes time reconciliation and variance tracking
- Appeals to enterprise users (Service IT+ team, project managers)
- Maintains the professional, data-driven brand identity
- Uses the brand colors (orange gradient, deep blue, gray)
