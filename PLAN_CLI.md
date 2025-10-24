# Plan: Linear CLI Implementation

## CLI Architecture

```
linear-cli <command> [options]

Commands:
  users                          List all users
  teams                          List all teams
  projects                       List all projects
  issues [options]               List issues with filters
  issue <id-or-key>              Get issue details
  comment <id-or-key> <text>     Add comment to issue
  update <id-or-key> [options]   Update issue fields

Global Options:
  -h, --help                     Show help
  --json                         Output raw JSON
```

Each subcommand supports `-h` or `--help` for detailed usage.

## Output Format

Following GitHub CLI conventions:
- Tab-separated fields
- ID prefixed with `#` as first column
- Human-readable by default
- `--json` flag for raw JSON output

## Complete Usage Examples

### Setup

```bash
export LINEAR_API_KEY="lin_api_xxx"
```

### List Commands

```bash
# List teams
$ node scripts/linear-cli.ts teams
Teams

#eng-team-id	Engineering	ENG
#prod-team-id	Product	PROD

$ node scripts/linear-cli.ts teams --help
Usage: linear-cli teams [options]

List all teams

Options:
  --json    Output raw JSON
  -h, --help    Show help

# List users
$ node scripts/linear-cli.ts users
Users

#john-id	John Doe	john@example.com
#jane-id	Jane Smith	jane@example.com

# List projects
$ node scripts/linear-cli.ts projects
Projects

#proj-1	Website Redesign	Active
#proj-2	Mobile App	Planned

# List all issues (default: limit 50, sorted by updated desc)
$ node scripts/linear-cli.ts issues
Issues

#ENG-123	Fix login bug	In Progress	John Doe
#ENG-124	Add dark mode	Todo	Jane Smith
#PROD-45	User research	Done	John Doe
```

### Filtered Issue Listings

```bash
# Filter by team
$ node scripts/linear-cli.ts issues --team eng-team-id
Issues

#ENG-123	Fix login bug	In Progress	John Doe
#ENG-124	Add dark mode	Todo	Jane Smith

$ node scripts/linear-cli.ts issues --help
Usage: linear-cli issues [options]

List issues with filters

Options:
  --team <id>       Filter by team ID
  --assignee <id>   Filter by assignee user ID
  --status <name>   Filter by status name
  --limit <n>       Limit results (default: 50)
  --json            Output raw JSON
  -h, --help        Show help

# Filter by assignee
$ node scripts/linear-cli.ts issues --assignee john-id
Issues

#ENG-123	Fix login bug	In Progress	John Doe
#PROD-45	User research	Done	John Doe

# Filter by status
$ node scripts/linear-cli.ts issues --status "In Progress"
Issues

#ENG-123	Fix login bug	In Progress	John Doe

# Combine filters
$ node scripts/linear-cli.ts issues --team eng-team-id --assignee john-id --status "In Progress"
Issues

#ENG-123	Fix login bug	In Progress	John Doe
```

### Get Issue Details

```bash
$ node scripts/linear-cli.ts issue ENG-123
Issue: #ENG-123

Title:		Fix login bug
Status:		In Progress
Assignee:	John Doe (john@example.com)
Team:		Engineering (ENG)
Priority:	High
Labels:		bug, p0
Created:	2025-01-15
Updated:	2025-01-20

Description:
Users cannot log in with SSO. Error occurs on callback redirect.

Comments:
  [2025-01-16] Jane Smith: I can reproduce this on staging
  [2025-01-18] John Doe: Working on a fix, tracking down the redirect issue

$ node scripts/linear-cli.ts issue --help
Usage: linear-cli issue <id-or-key> [options]

Get detailed information about an issue

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)

Options:
  --json       Output raw JSON
  -h, --help   Show help
```

### Comment on Issue

```bash
$ node scripts/linear-cli.ts comment ENG-123 "Fix deployed to staging"
✓ Comment added to #ENG-123

$ node scripts/linear-cli.ts comment --help
Usage: linear-cli comment <id-or-key> <text> [options]

Add a comment to an issue

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)
  text         Comment text

Options:
  --json       Output raw JSON (comment details)
  -h, --help   Show help
```

### Update Issue

```bash
# Update status
$ node scripts/linear-cli.ts update ENG-123 --status "Done"
✓ Issue #ENG-123 updated

# Update assignee
$ node scripts/linear-cli.ts update ENG-123 --assignee jane-id
✓ Issue #ENG-123 updated

# Update multiple fields
$ node scripts/linear-cli.ts update ENG-123 --assignee jane-id --priority 1 --status "In Progress"
✓ Issue #ENG-123 updated

$ node scripts/linear-cli.ts update --help
Usage: linear-cli update <id-or-key> [options]

Update an issue

Arguments:
  id-or-key         Issue identifier (e.g., ENG-123 or full UUID)

Options:
  --status <name>   Update status
  --assignee <id>   Update assignee (user ID)
  --priority <n>    Update priority (0-4)
  --title <text>    Update title
  --description <text>  Update description
  --json            Output raw JSON
  -h, --help        Show help
```

### Error Handling

```bash
# Missing API key
$ node scripts/linear-cli.ts teams
Error: LINEAR_API_KEY environment variable not set

Please set it with:
  export LINEAR_API_KEY="your-api-key"

Get your API key from: https://linear.app/settings/api

# Invalid command
$ node scripts/linear-cli.ts invalid
Error: Unknown command 'invalid'

Run 'linear-cli --help' for usage

# Invalid issue identifier
$ node scripts/linear-cli.ts issue INVALID-123
Error: Issue not found: INVALID-123

# API error
$ node scripts/linear-cli.ts teams
Error: Linear API request failed
Status: 401 Unauthorized
Check your LINEAR_API_KEY is valid
```

## Implementation Details

### Dependencies
- **Linear SDK**: `@linear/sdk` (official TypeScript SDK)
- **No CLI framework**: Use `process.argv` for truly minimal dependencies
- **TypeScript**: For type safety with Linear SDK

### Technical Requirements
- Accept both issue key (ENG-123) and full UUID for issue commands
- Default limit for issues: 50
- Default sort: updated descending
- Exit codes: 0 = success, 1 = error
- Support `--json` flag on all commands for machine-readable output
- Tab-separated output (easy to parse with `cut`, `awk`, etc.)

### Code Structure
```typescript
// Main structure
- parseArgs(): Parse command line arguments
- commands/: Each command in separate function
  - users()
  - teams()
  - projects()
  - issues(filters)
  - issue(id)
  - comment(id, text)
  - update(id, fields)
- formatters/: Output formatting
  - formatTable(data)
  - formatJson(data)
- utils/: Helper functions
  - getLinearClient()
  - resolveIssue(idOrKey)
  - handleError(error)
```

### Key Design Principles
- Zero config if LINEAR_API_KEY is set
- Sensible defaults (limit, sort order)
- Clear, scannable output format
- Composable with Unix tools (grep, cut, jq with --json)
- Helpful error messages with actionable next steps
- Tab-separated fields for easy parsing
- Follow GitHub CLI UX patterns
