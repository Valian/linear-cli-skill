---
name: linear
description: Work with Linear issues via CLI - use this skill whenever the user asks about Linear issues, creating, updating, commenting on, or deleting issues, or checking issue status and details
version: 0.1.0
---

# Linear Issue Management

**IMPORTANT: Use this skill whenever the user mentions Linear or asks to work with issues, create issues, update issues, comment on issues, check issue status, or perform any Linear-related operations.**

This skill provides a lightweight CLI to interact with Linear's issue tracking system. Use it for:
- Creating new issues
- Viewing issue details and status
- Updating issue fields (status, assignee, priority, etc.)
- Adding comments to issues
- Deleting issues
- Listing issues with filters
- Managing teams, users, and projects

The CLI is written in JavaScript and uses Linear's official SDK. It runs from the skill directory with minimal dependencies.

## Setup

Before using the Linear CLI, ensure the API key is configured:

1. Check if `.env` file exists in the skill directory
2. If not, instruct the user to create one:
   ```bash
   echo 'LINEAR_API_KEY=your-api-key' > .env
   ```
3. API key can be obtained from: https://linear.app/settings/api (Settings > API > Personal API keys > Create key)

## Running Commands

**Note:** All commands assume you are in the skill directory. The CLI executable is `./linear`.

Execute commands using the pattern: **resource → action**

```bash
./linear <resource> <action> [arguments] [options]
```

Available resources:
- `issue` - Work with issues (list, view, create, update, delete, comment)
- `user` - Work with users (list)
- `team` - Work with teams (list)
- `project` - Work with projects (list)

Dependencies install automatically on first run.

## Available Commands

### List Users

Get all users in the workspace:

```bash
./linear user list
```

**Output format:**
```
Users

#<user-id>	<name>	<email>
```

**Example:**
```bash
./linear user list
# Output:
# Users
#
# #abc123	John Doe	john@example.com
# #def456	Jane Smith	jane@example.com
```

**Use when:** You need to find a user ID for assigning issues or filtering.

---

### List Teams

Get all teams in the workspace:

```bash
./linear team list
```

**Output format:**
```
Teams

#<team-id>	<name>	<key>
```

**Example:**
```bash
./linear team list
# Output:
# Teams
#
# #team123	Engineering	ENG
# #team456	Product	PROD
```

**Use when:** You need a team ID for filtering issues or understanding workspace structure.

---

### List Projects

Get all projects in the workspace:

```bash
./linear project list
```

**Output format:**
```
Projects

#<project-id>	<name>	<state>
```

**Example:**
```bash
./linear project list
# Output:
# Projects
#
# #proj123	Website Redesign	started
# #proj456	Mobile App	planned
```

**Use when:** You need to understand active projects in the workspace.

---

### List Issues

Get issues with optional filters:

```bash
./linear issue list [options]
```

**Options:**
- `--team <id>` - Filter by team ID
- `--assignee <id>` - Filter by assignee user ID
- `--status <name>` - Filter by status name (e.g., "In Progress", "Done")
- `--limit <n>` - Limit results (default: 50)

**Output format:**
```
Issues

#<identifier>	<title>	<status>	<assignee>
```

**Examples:**

List recent issues (default 50):
```bash
./linear issue list
# Output:
# Issues
#
# #ENG-123	Fix login bug	In Progress	John Doe
# #ENG-124	Add dark mode	Todo	Jane Smith
```

Filter by team:
```bash
./linear issue list --team abc123 --limit 10
```

Filter by assignee and status:
```bash
./linear issue list --assignee def456 --status "In Progress"
```

Combine filters:
```bash
./linear issue list --team abc123 --assignee def456 --status "Ready" --limit 5
```

**Use when:** You need to see what issues exist, what someone is working on, or issues in a specific state.

---

### View Issue Details

Get detailed information about a specific issue:

```bash
./linear issue view <id-or-key>
```

**Arguments:**
- `<id-or-key>` - Issue identifier (e.g., `ENG-123`) or full UUID

**Output includes:**
- Title, status, assignee, team
- Priority, labels
- Created/updated dates
- Description
- Comments with timestamps and authors

**Example:**
```bash
./linear issue view ENG-123
# Output:
# Issue: #ENG-123
#
# Title:		Fix login bug
# Status:		In Progress
# Assignee:	John Doe (john@example.com)
# Team:		Engineering (ENG)
# Priority:	High
# Labels:		bug, p0
# Created:	2025-01-15
# Updated:	2025-01-20
#
# Description:
# Users cannot log in with SSO...
#
# Comments:
#   [2025-01-16] Jane: I can reproduce this
#   [2025-01-18] John: Working on a fix
```

**Use when:** You need complete information about an issue including description, comments, and metadata.

---

### Create Issue

Create a new issue:

```bash
./linear issue create <title> [options]
```

**Arguments:**
- `<title>` - Issue title (multi-word titles automatically combined)

**Options:**
- `--team <id>` - Team ID (required)
- `--description <text>` - Issue description
- `--assignee <id>` - Assignee user ID
- `--priority <n>` - Priority (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)
- `--status <name>` - Initial status name

**Examples:**

Create basic issue:
```bash
./linear issue create "Fix login bug" --team abc123
# Output:
# ✓ Issue created: #ENG-124
#   Title: Fix login bug
#   URL: https://linear.app/...
```

Create with full details:
```bash
./linear issue create "Implement dark mode" --team abc123 --description "Add dark mode support to the app" --assignee def456 --priority 2 --status "Ready"
# Output:
# ✓ Issue created: #ENG-125
#   Title: Implement dark mode
#   URL: https://linear.app/...
```

Multi-word titles work without quotes:
```bash
./linear issue create Fix login bug on mobile --team abc123
```

**Use when:** You need to create a new issue from the command line.

**Note:** The `--team` flag is required. Get team IDs using `./linear team list`.

---

### Add Comment

Add a comment to an issue:

```bash
./linear issue comment <id-or-key> <text>
```

**Arguments:**
- `<id-or-key>` - Issue identifier (e.g., `ENG-123`) or full UUID
- `<text>` - Comment text (multi-word text automatically combined)

**Example:**
```bash
./linear issue comment ENG-123 "Fix deployed to staging"
# Output:
# ✓ Comment added to #ENG-123
```

Multi-word comments work without quotes:
```bash
./linear issue comment ENG-123 This is a test comment
```

**Use when:** You need to add context, updates, or questions to an issue.

---

### Update Issue

Update issue fields:

```bash
./linear issue update <id-or-key> [options]
```

**Arguments:**
- `<id-or-key>` - Issue identifier (e.g., `ENG-123`) or full UUID

**Options:**
- `--status <name>` - Update status (e.g., "Done", "In Progress")
- `--assignee <id>` - Update assignee (user ID)
- `--priority <n>` - Update priority (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)
- `--title <text>` - Update title
- `--description <text>` - Update description

Multiple fields can be updated in one command.

**Examples:**

Update status:
```bash
./linear issue update ENG-123 --status "Done"
# Output:
# ✓ Issue #ENG-123 updated
```

Update assignee:
```bash
./linear issue update ENG-123 --assignee abc123
```

Update multiple fields:
```bash
./linear issue update ENG-123 --status "In Progress" --assignee abc123 --priority 1
```

**Use when:** You need to change issue status, reassign, or update other fields.

---

### Delete Issue

Delete an issue (moves to trash):

```bash
./linear issue delete <id-or-key>
```

**Arguments:**
- `<id-or-key>` - Issue identifier (e.g., `ENG-123`) or full UUID

**Example:**
```bash
./linear issue delete ENG-123
# Output:
# ✓ Issue #ENG-123 deleted (moved to trash)
```

**Use when:** You need to remove an issue. Note that this is a soft delete - the issue moves to trash and can be restored.

**Important:** Deleted issues can be recovered from Linear's trash. This is not a permanent deletion.

---

## JSON Output

All commands support `--json` flag for machine-readable output:

```bash
./linear team list --json
./linear issue view ENG-123 --json
```

Use this when you need to parse output programmatically or want complete data structures.

---

## Help

Every command has built-in help:

```bash
./linear --help
./linear issue --help
./linear issue list --help
./linear issue update --help
```

---

## Common Workflows

### Find and update an issue

```bash
# 1. Find issues by status
./linear issue list --status "Ready" --limit 5

# 2. Get details about specific issue
./linear issue view ENG-123

# 3. Start working on it
./linear issue update ENG-123 --status "In Progress"

# 4. Add progress update
./linear issue comment ENG-123 "Implemented the fix, testing now"

# 5. Mark as done
./linear issue update ENG-123 --status "Done"
```

### Check team workload

```bash
# 1. Get team ID
./linear team list

# 2. See all team issues
./linear issue list --team <team-id>

# 3. Filter by status
./linear issue list --team <team-id> --status "In Progress"
```

### Check assignee's work

```bash
# 1. Get user ID
./linear user list

# 2. See their issues
./linear issue list --assignee <user-id>

# 3. Get details on specific issue
./linear issue view ENG-123
```

### Create and track a new issue

```bash
# 1. Get team ID
./linear team list

# 2. Create new issue
./linear issue create "Implement new feature" --team <team-id> --description "Detailed description here" --priority 2

# 3. Note the issue ID from output (e.g., ENG-124)

# 4. Add updates as you work
./linear issue comment ENG-124 "Started implementation"

# 5. Update status when ready
./linear issue update ENG-124 --status "Done"
```

### Clean up old issues

```bash
# 1. Find old issues
./linear issue list --status "Canceled" --limit 10

# 2. Delete unwanted issues
./linear issue delete ENG-999

# Note: Issues move to trash and can be recovered
```

---

## Error Handling

The CLI provides clear error messages:

**Missing API key:**
```
Error: LINEAR_API_KEY not found

Please provide your Linear API key in one of these ways:

1. Environment variable:
   export LINEAR_API_KEY="your-api-key"

2. Create a .env file next to the linear executable:
   echo 'LINEAR_API_KEY=your-api-key' > linear/.env

Get your API key from: https://linear.app/settings/api
```

**Issue not found:**
```
Error: Issue not found: ENG-999
```

**Invalid status:**
```
Error: Status 'InvalidStatus' not found
```

When errors occur, read the error message and guide the user on how to fix it.

---

## Important Notes

- Issue identifiers are case-insensitive (MIN-123 = min-123)
- Status names must match exactly (case-sensitive)
- User IDs and team IDs are UUIDs (long alphanumeric strings with dashes)
- Issue keys use format: `<TEAM_KEY>-<NUMBER>` (e.g., ENG-123)
- Default issue limit is 50; use `--limit` to adjust
- Comments are added by the API key owner
- Priority values: 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low

---

## Limitations

- Cannot manage labels or projects directly
- Cannot attach files to issues
- Limited to 50 issues by default in list view (use `--limit` to increase)
- Delete is soft delete only (moves to trash, not permanent)
- Cannot set multiple labels or custom fields during creation

For advanced operations (managing projects, labels, custom fields, file attachments), direct the user to Linear's web interface or suggest using Linear's full API.
