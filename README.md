# Linear CLI Skill

A Claude skill that provides a lightweight CLI for working with Linear issues. Written in JavaScript with minimal dependencies (only Linear SDK and dotenv).

Following GitHub CLI conventions for consistency and ease of use.

## What's included

- **`linear/`** - Standalone CLI tool with minimal dependencies
- **`linear/SKILL.md`** - Claude skill documentation for using the CLI
- **`.claude-plugin/marketplace.json`** - Marketplace definition for easy installation in Claude
- **Plans/** - Implementation planning documents

## Installation in Claude

Install this skill in Claude Code using the plugin marketplace:

```bash
claude plugin marketplace add Valian/linear-cli-skill
claude plugin install linear
```

The skill will then be available for working with Linear issues directly through Claude.

## Installation

Dependencies are automatically installed on first run. If you want to install manually:

```bash
cd linear/
npm install
```

## Setup

Get your Linear API key:
1. Go to https://linear.app/settings/api
2. Navigate to Settings > API > Personal API keys
3. Click "Create key"

Provide your API key in one of these ways:

### Option 1: Environment variable (temporary)
```bash
export LINEAR_API_KEY="your-api-key"
```

### Option 2: .env file (persistent, recommended)
Create a `.env` file next to the `linear` executable:
```bash
echo 'LINEAR_API_KEY=your-api-key' > linear/.env
```

Or create it manually:
```
# linear/.env
LINEAR_API_KEY=your-api-key
```

## Quick Start

```bash
# Setup API key
echo 'LINEAR_API_KEY=your-api-key' > linear/.env

# Run the CLI
./linear/linear team list
./linear/linear issue list --limit 5
```

## Usage

Run the CLI using the `linear` executable:

```bash
./linear/linear <resource> <action> [arguments] [options]
```

Or via npm from the `linear/` directory:

```bash
cd linear/
npm run cli -- <resource> <action> [arguments] [options]
```

### Resources

The CLI follows the pattern: `resource → action`, similar to the GitHub CLI.

Available resources:
- `issue` - Work with issues (list, view, create, update, delete, comment)
- `user` - Work with users (list)
- `team` - Work with teams (list)
- `project` - Work with projects (list)

### Commands

#### List Users
```bash
./linear user list
./linear user list --json
```

#### List Teams
```bash
./linear team list
./linear team list --json
```

#### List Projects
```bash
./linear project list
./linear project list --json
```

#### List Issues
```bash
# List all issues (default limit: 50)
./linear issue list

# Filter by team
./linear issue list --team <team-id>

# Filter by assignee
./linear issue list --assignee <user-id>

# Filter by status
./linear issue list --status "In Progress"

# Combine filters
./linear issue list --team <team-id> --assignee <user-id> --status "Ready" --limit 10

# JSON output
./linear issue list --json
```

#### View Issue Details
```bash
# Using issue identifier (e.g., MIN-892)
./linear issue view MIN-892

# Using issue UUID
./linear issue view <issue-uuid>

# JSON output
./linear issue view MIN-892 --json
```

#### Create Issue
```bash
# Create basic issue (--team is required)
./linear issue create "Fix login bug" --team <team-id>

# Create with full details
./linear issue create "New feature" --team <team-id> --body "Details here" --assignee @me --priority 2 --status "Todo"

# With labels (multiple ways)
./linear issue create "Bug fix" --team <team-id> --label bug --label urgent
./linear issue create "Feature" --team <team-id> --label "bug,p0,feature"

# With project assignment
./linear issue create "Task" --team <team-id> --project <project-id>

# Create sub-issue
./linear issue create "Subtask" --team <team-id> --parent PROJ-123

# With estimate and due date
./linear issue create "Sprint task" --team <team-id> --estimate 5 --due-date 2025-12-31

# Read description from file or stdin
./linear issue create "Issue" --team <team-id> --body-file description.md
echo "Long description" | ./linear issue create "Issue" --team <team-id> --body-file -
```

#### Add Comment to Issue
```bash
./linear issue comment MIN-892 "Your comment text here"
./linear issue comment MIN-892 "Multi word comment"
```

#### Update Issue
```bash
# Update status (common: "Backlog", "Todo", "In Progress", "Done", "Canceled")
./linear issue update MIN-892 --status "Done"

# Update assignee (use @me for yourself)
./linear issue update MIN-892 --assignee @me

# Update priority (0=None, 1=Urgent/P0, 2=High/P1, 3=Medium/P2, 4=Low/P3)
./linear issue update MIN-892 --priority 1

# Update title
./linear issue update MIN-892 --title "New title"

# Update description
./linear issue update MIN-892 --body "New description"

# Read description from file or stdin
./linear issue update MIN-892 --body-file description.md
echo "Updated description" | ./linear issue update MIN-892 --body-file -

# Add labels
./linear issue update MIN-892 --label bug --label urgent

# Assign to project
./linear issue update MIN-892 --project <project-id>

# Set parent issue (create sub-issue)
./linear issue update MIN-892 --parent PROJ-123

# Set estimate and due date
./linear issue update MIN-892 --estimate 5 --due-date 2025-12-31

# Update multiple fields
./linear issue update MIN-892 --status "In Progress" --assignee @me --priority 2 --label bug
```

#### Delete Issue
```bash
# Delete issue (moves to trash)
./linear issue delete MIN-892
```

### Help

```bash
# General help
./linear --help

# Resource-specific help
./linear user --help
./linear team --help
./linear project --help
./linear issue --help

# Action-specific help
./linear issue list --help
./linear issue view --help
./linear issue create --help
./linear issue update --help
./linear issue delete --help
./linear issue comment --help
```

## Advanced Features

### Labels
Add labels to issues using `--label`:
```bash
# Multiple labels (separate flags)
./linear issue create "Title" --team <team-id> --label bug --label urgent

# Multiple labels (comma-separated)
./linear issue create "Title" --team <team-id> --label "bug,urgent,p0"
```

**Note:** Labels must exist in the team before use. If a label doesn't exist, the CLI will error and display all available labels for that team.

### Reading from Files or Stdin
Use `--body-file` to read descriptions from files or stdin (following `gh` CLI conventions):
```bash
# From file
./linear issue create "Title" --team <team-id> --body-file description.md

# From stdin
echo "Description text" | ./linear issue create "Title" --team <team-id> --body-file -
cat description.md | ./linear issue create "Title" --team <team-id> --body-file -
```

### Assignee Shortcuts
Use `@me` to assign issues to yourself:
```bash
./linear issue create "Title" --team <team-id> --assignee @me
./linear issue update PROJ-123 --assignee @me
```

### Sub-issues
Create hierarchical issues with `--parent`:
```bash
./linear issue create "Subtask" --team <team-id> --parent PROJ-123
```

### Project Assignment
Assign issues to projects:
```bash
./linear issue create "Task" --team <team-id> --project <project-id>
```

### Estimates and Due Dates
Set story points and due dates:
```bash
./linear issue create "Sprint task" --team <team-id> --estimate 5 --due-date 2025-12-31
```

### Priority Levels
Priority mapping (matches Linear's API):
- `0` = None
- `1` = Urgent (P0)
- `2` = High (P1)
- `3` = Medium (P2)
- `4` = Low (P3)

## Output Format

By default, the CLI outputs tab-separated values with IDs prefixed by `#`:

```
Users

#user-id	User Name	email@example.com
```

This format is easy to parse with standard Unix tools like `cut`, `awk`, or `grep`.

Use `--json` for machine-readable JSON output.

## Examples

```bash
# Get team ID
./linear team list
# Output: #28adfef1-7a2b-4908-b563-089fed6dd71a	Mind Nexus	MIN

# List issues for that team
./linear issue list --team 28adfef1-7a2b-4908-b563-089fed6dd71a --limit 5

# Get issue details
./linear issue view MIN-892

# Add a comment
./linear issue comment MIN-892 "Working on this now"

# Update status
./linear issue update MIN-892 --status "Done"
```

## Error Handling

The CLI provides helpful error messages:

- Missing API key: Shows how to set `LINEAR_API_KEY`
- Invalid commands: Shows available commands
- Missing arguments: Shows command-specific help
- API errors: Shows descriptive error messages

Exit codes:
- `0`: Success
- `1`: Error
