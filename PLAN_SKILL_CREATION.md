# Plan: Creating and Documenting the Linear Skill

## Overview

Create a Claude skill for Linear integration following the official skill creation guidelines from Anthropic.

## References

- **Skill Creator Guide**: https://github.com/anthropics/skills/blob/main/skill-creator/SKILL.md
- **DOCX Skill Example**: https://github.com/anthropics/skills/blob/main/document-skills/docx/SKILL.md
- **Webapp Testing Skill Example**: https://github.com/anthropics/skills/blob/main/webapp-testing/SKILL.md
- **Skills Repository**: https://github.com/anthropics/skills
- **Linear TypeScript SDK**: https://linear.app/developers/sdk
- **GitHub CLI** (reference for output formatting): https://cli.github.com/

## Skill Structure

```
linear/
├── SKILL.md                    # Main skill documentation (required)
├── scripts/
│   └── linear-cli.ts          # TypeScript CLI using Linear SDK
├── package.json               # Node dependencies (Linear SDK only)
└── tsconfig.json              # TypeScript config
```

## SKILL.md Components

### 1. YAML Metadata

```yaml
---
name: linear
description: Work with Linear issues via CLI
version: 0.1.0
---
```

### 2. Main Documentation Sections

- **Overview**: Brief intro to Linear integration and what the skill enables
- **Setup**:
  - How to install dependencies (`npm install`)
  - API token configuration (LINEAR_API_KEY environment variable)
  - Where to obtain API key (https://linear.app/settings/api)
- **CLI Commands**: Complete reference for each command with help output
- **Usage Examples**: Common workflows
  - Filtering issues by team/assignee
  - Getting issue details
  - Commenting on issues
  - Updating issue fields
- **Error Handling**: What to do when API token missing or requests fail

### 3. Progressive Disclosure Approach

- Start with simple examples (list teams, get single issue)
- Progress to complex filters and updates
- Keep CLI usage instructions concise, imperative form
- Treat CLI as "black box" - don't expose Linear SDK internals

## Integration Approach

- Package CLI as standalone executable via `tsx` or compile with `tsc`
- Document CLI as black-box tool: "Use `node scripts/linear-cli.ts <command>`"
- No need to expose Linear SDK details in skill documentation
- Focus on CLI interface and output format, not implementation
- Follow GitHub CLI conventions for UX and formatting

## Key Principles

- **Minimal dependencies**: Only Linear SDK required
- **Self-contained**: Skill works independently
- **Clear documentation**: Imperative, procedural instructions
- **Efficient context**: Don't pollute context with implementation details
- **Well-behaved CLI**: Proper help, error messages, exit codes

## Output Format

Follow GitHub CLI conventions:
- Tab-separated fields for easy parsing
- ID prefixed with `#` as first column
- Human-readable by default
- `--json` flag for machine-readable output
- Clear section headers

## Next Steps

1. Implement Linear CLI (see PLAN_CLI.md)
2. Test all CLI commands thoroughly
3. Write SKILL.md with usage examples
4. Validate skill structure
5. Test skill with Claude
6. Iterate based on feedback
