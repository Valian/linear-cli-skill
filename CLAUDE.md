# Linear CLI - Development Guide

CLI replacement for Linear MCP. Designed for extending, modifying, and maintaining this tool.

## Project Philosophy

1. **Token efficiency** - PRIMARY GOAL: Minimize output tokens. Tab-separated format, no decorations, concise errors
2. **GitHub CLI pattern** - `resource → action` structure: `./linear issue list` (like `gh`)
3. **No TypeScript** - JavaScript only, reduces install overhead
4. **Unix-friendly** - Easy to pipe, parse, compose with standard tools
5. **Self-contained** - Auto-installs deps, clear error messages

## Architecture

### Structure
```
linear/
  ├── linear              # Executable (calls scripts/linear-cli.js)
  ├── scripts/
  │   └── linear-cli.js   # Main implementation (~840 lines)
  ├── package.json        # Deps: @linear/sdk, dotenv only
  ├── .env               # Optional: LINEAR_API_KEY
  └── SKILL.md           # User-facing docs
```

### Command Pattern
```
./linear <resource> <action> [arguments] [options]
```

Resources: `issue`, `user`, `team`, `project`

### Key Implementation Details

**Argument parsing** (linear-cli.js:12): Custom, no deps
- `--key value` or `--flag` (boolean)
- Multi-word args auto-joined (lines 771, 801)

**GraphQL usage**: Direct queries for efficiency
- `listIssues` (line 314): Preloads all relations in single query → fewer tokens
- `getIssue` (lines 360, 404): Separate paths for identifier vs UUID
- Avoids N+1 queries that bloat responses

**Output format** (default):
```
#<id>	<field1>	<field2>
```
- `#` prefix on IDs for parsing
- Tab-separated, no pretty tables
- `--json` for raw JSON when needed

**Error handling**: Actionable messages, no stack traces
- API key error (line 235): Shows exact setup steps
- Exit 0 = success, 1 = error

## Token Reduction Strategies

This is a **key requirement**. Every design decision optimizes for minimal output:

1. **Tab-separated output** - No tables, no formatting, no decorations
2. **`#` ID prefix** - Visual separator without verbose labels like "ID: "
3. **Single GraphQL queries** - Preload relations, avoid multiple roundtrips
4. **Concise help** - Examples only where essential
5. **No colors/ASCII art** - Plain text only
6. **Terse errors** - Short message + fix, nothing extra

When extending, always ask: "Can this output be shorter?"

## Extending the CLI

### Add New Resource

1. Create help function (see `showUserHelp`, line 64)
2. Create action handler (see `listUsers`, line 260)
3. Add switch case in `main()` (line 714)

### Add New Action

Example: Adding `issue archive`:

```javascript
// 1. Help function
function showIssueArchiveHelp() {
  console.log(`Usage: linear-cli issue archive <id-or-key>

Archive an issue

Arguments:
  id-or-key    Issue identifier

Examples:
  linear-cli issue archive ENG-123`)
}

// 2. Handler
async function archiveIssue(identifier, flags) {
  const client = getLinearClient()
  // Implementation...
}

// 3. Add to issue switch (line 749)
case "archive":
  if (args.length === 0) {
    console.error(`Error: Missing issue identifier

Run 'linear-cli issue archive --help' for usage`)
    process.exit(1)
  }
  await archiveIssue(args[0], flags)
  break

// 4. Update showIssueHelp() to list new action
```

### GraphQL Pattern

```javascript
const graphQLClient = client.client
const response = await graphQLClient.rawRequest(
  `query name($var: Type!) {
    field {
      subfield
    }
  }`,
  { var: value }
)
const data = response.data.field
```

Use raw GraphQL for:
- Preloading nested relations
- Complex filters
- Custom field selection to reduce payload

### Finding Issues by Identifier

Pattern at lines 356-444:
```javascript
if (identifier.includes("-")) {
  // Parse as TEAM-NUMBER
  const [teamKey, issueNumber] = identifier.toUpperCase().split("-")
  // Query by team key + number
} else {
  // Treat as UUID
  // Query by ID
}
```

## Common Patterns

**Multi-word arguments**: Joined automatically
```bash
./linear issue create Fix the bug --team abc  # Works without quotes
```

**Status lookup**: Case-insensitive comparison (lines 545, 604)
```javascript
const state = states.nodes.find(s =>
  s.name.toLowerCase() === flags.status.toLowerCase()
)
```

**Priority mapping** (lines 460-466): 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low

## Testing Changes

```bash
cd linear/
npm install
./linear issue list --limit 3
./linear team list
```

No formal test suite. Manual testing only.

## Key Constraints

- **No TypeScript** - Keep install fast
- **Minimal deps** - Only @linear/sdk + dotenv
- **No CLI frameworks** - Custom parsing keeps it lean
- **No formatting libs** - Raw tab-separated output
- **Self-documenting errors** - Include fix in error message

## Quick Reference

```bash
# Commands follow: resource → action
./linear user list
./linear team list
./linear project list
./linear issue list [--team <id>] [--assignee <id>] [--status <name>]
./linear issue view <id>
./linear issue create <title> --team <id> [options]
./linear issue update <id> [options]
./linear issue comment <id> <text>
./linear issue delete <id>
```

User-facing docs in `SKILL.md` and `README.md`.
