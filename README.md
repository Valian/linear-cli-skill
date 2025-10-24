# Linear CLI Skill

A Claude skill that provides a lightweight CLI for working with Linear issues. This skill uses the official Linear TypeScript SDK to interact with Linear's API.

## What's included

- **`linear/`** - Standalone CLI tool with minimal dependencies
- **`linear/SKILL.md`** - Claude skill documentation for using the CLI
- **`.claude-plugin/marketplace.json`** - Marketplace definition for easy installation in Claude
- **Plans/** - Implementation planning documents

## Installation in Claude

This skill can be installed in Claude Code using the marketplace definition:

1. Copy the repository URL
2. In Claude Code, install the skill using the marketplace.json
3. The skill will be available for use with Linear commands

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
./linear/linear teams
./linear/linear issues --limit 5
```

## Usage

Run the CLI using the `linear` executable:

```bash
./linear/linear <command> [options]
```

Or via npm from the `linear/` directory:

```bash
cd linear/
npm run cli -- <command> [options]
```

### Commands

#### List Users
```bash
./linear users
./linear users --json
```

#### List Teams
```bash
./linear teams
./linear teams --json
```

#### List Projects
```bash
./linear projects
./linear projects --json
```

#### List Issues
```bash
# List all issues (default limit: 50)
./linear issues

# Filter by team
./linear issues --team <team-id>

# Filter by assignee
./linear issues --assignee <user-id>

# Filter by status
./linear issues --status "In Progress"

# Combine filters
./linear issues --team <team-id> --assignee <user-id> --status "Ready" --limit 10

# JSON output
./linear issues --json
```

#### Get Issue Details
```bash
# Using issue identifier (e.g., MIN-892)
./linear issue MIN-892

# Using issue UUID
./linear issue <issue-uuid>

# JSON output
./linear issue MIN-892 --json
```

#### Create Issue
```bash
# Create basic issue (--team is required)
./linear create "Fix login bug" --team <team-id>

# Create with full details
./linear create "New feature" --team <team-id> --description "Details here" --assignee <user-id> --priority 2 --status "Ready"
```

#### Add Comment
```bash
./linear comment MIN-892 "Your comment text here"
./linear comment MIN-892 "Multi word comment"
```

#### Update Issue
```bash
# Update status
./linear update MIN-892 --status "Done"

# Update assignee
./linear update MIN-892 --assignee <user-id>

# Update priority (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)
./linear update MIN-892 --priority 1

# Update title
./linear update MIN-892 --title "New title"

# Update description
./linear update MIN-892 --description "New description"

# Update multiple fields
./linear update MIN-892 --status "In Progress" --assignee <user-id> --priority 2
```

#### Delete Issue
```bash
# Delete issue (moves to trash)
./linear delete MIN-892
```

### Help

```bash
# General help
./linear --help

# Command-specific help
./linear users --help
./linear teams --help
./linear projects --help
./linear issues --help
./linear issue --help
./linear create --help
./linear comment --help
./linear update --help
./linear delete --help
```

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
./linear teams
# Output: #28adfef1-7a2b-4908-b563-089fed6dd71a	Mind Nexus	MIN

# List issues for that team
./linear issues --team 28adfef1-7a2b-4908-b563-089fed6dd71a --limit 5

# Get issue details
./linear issue MIN-892

# Add a comment
./linear comment MIN-892 "Working on this now"

# Update status
./linear update MIN-892 --status "Done"
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
