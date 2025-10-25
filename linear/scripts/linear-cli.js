#!/usr/bin/env node
import { LinearClient } from "@linear/sdk"
import { config } from "dotenv"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
// Get the directory of the linear executable (parent of scripts/)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const linearDir = join(__dirname, "..")
// Load environment variables from .env file next to linear executable
config({ path: join(linearDir, ".env") })
function parseArgs(argv) {
  const args = []
  const flags = {}
  let resource = ""
  let action = ""
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith("--")) {
      const key = arg.slice(2)
      const nextArg = argv[i + 1]
      if (nextArg && !nextArg.startsWith("-")) {
        flags[key] = nextArg
        i++
      } else {
        flags[key] = true
      }
    } else if (arg.startsWith("-")) {
      flags[arg.slice(1)] = true
    } else if (!resource) {
      resource = arg
    } else if (!action) {
      action = arg
    } else {
      args.push(arg)
    }
  }
  return { resource, action, args, flags }
}
function showHelp() {
  console.log(`linear-cli - CLI for working with Linear

Usage: linear-cli <resource> <action> [arguments] [options]

Resources:
  issue      Work with issues
  user       Work with users
  team       Work with teams
  project    Work with projects

Global Options:
  -h, --help    Show help
  --json        Output raw JSON

Run 'linear-cli <resource> --help' for resource-specific help
Run 'linear-cli <resource> <action> --help' for action-specific help

Examples:
  linear-cli issue list
  linear-cli issue view ENG-123
  linear-cli issue create "Fix bug" --team <team-id>
  linear-cli user list`)
}
function showUserHelp() {
  console.log(`Usage: linear-cli user <action>

Actions:
  list    List all users

Options:
  --json       Output raw JSON
  -h, --help   Show help

Examples:
  linear-cli user list
  linear-cli user list --json`)
}
function showTeamHelp() {
  console.log(`Usage: linear-cli team <action>

Actions:
  list    List all teams

Options:
  --json       Output raw JSON
  -h, --help   Show help

Examples:
  linear-cli team list
  linear-cli team list --json`)
}
function showProjectHelp() {
  console.log(`Usage: linear-cli project <action>

Actions:
  list    List all projects

Options:
  --json       Output raw JSON
  -h, --help   Show help

Examples:
  linear-cli project list
  linear-cli project list --json`)
}
function showIssueHelp() {
  console.log(`Usage: linear-cli issue <action> [arguments] [options]

Actions:
  list                            List issues with filters
  view <id-or-key>                Get detailed information about an issue
  create <title>                  Create a new issue
  update <id-or-key>              Update an issue
  delete <id-or-key>              Delete an issue (moves to trash)
  comment <id-or-key> <text>      Add a comment to an issue

Global Options:
  --json       Output raw JSON
  -h, --help   Show help

Run 'linear-cli issue <action> --help' for action-specific help`)
}
function showIssueListHelp() {
  console.log(`Usage: linear-cli issue list [options]

List issues with filters

Options:
  --team <id>       Filter by team ID
  --assignee <id>   Filter by assignee user ID
  --status <name>   Filter by status name
  --limit <n>       Limit results (default: 50)
  --json            Output raw JSON
  -h, --help        Show help

Examples:
  linear-cli issue list
  linear-cli issue list --team <team-id>
  linear-cli issue list --status "In Progress" --limit 10`)
}
function showIssueViewHelp() {
  console.log(`Usage: linear-cli issue view <id-or-key> [options]

Get detailed information about an issue

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)

Options:
  --json       Output raw JSON
  -h, --help   Show help

Examples:
  linear-cli issue view ENG-123
  linear-cli issue view <issue-uuid> --json`)
}
function showIssueCreateHelp() {
  console.log(`Usage: linear-cli issue create <title> [options]

Create a new issue

Arguments:
  title                 Issue title

Options:
  --team <id>           Team ID (required)
  --description <text>  Issue description
  --assignee <id>       Assignee user ID
  --priority <n>        Priority (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)
  --status <name>       Initial status name
  --json                Output raw JSON
  -h, --help            Show help

Examples:
  linear-cli issue create "Fix bug" --team <team-id>
  linear-cli issue create "New feature" --team <team-id> --description "Details" --priority 2`)
}
function showIssueUpdateHelp() {
  console.log(`Usage: linear-cli issue update <id-or-key> [options]

Update an issue

Arguments:
  id-or-key         Issue identifier (e.g., ENG-123 or full UUID)

Options:
  --status <name>   Update status
  --assignee <id>   Update assignee (user ID)
  --priority <n>    Update priority (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)
  --title <text>    Update title
  --description <text>  Update description
  --json            Output raw JSON
  -h, --help        Show help

Examples:
  linear-cli issue update ENG-123 --status "In Progress"
  linear-cli issue update ENG-123 --assignee <user-id> --priority 1`)
}
function showIssueDeleteHelp() {
  console.log(`Usage: linear-cli issue delete <id-or-key> [options]

Delete an issue (moves to trash)

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)

Options:
  --json       Output raw JSON
  -h, --help   Show help

Examples:
  linear-cli issue delete ENG-123
  linear-cli issue delete <issue-uuid>`)
}
function showIssueCommentHelp() {
  console.log(`Usage: linear-cli issue comment <id-or-key> <text> [options]

Add a comment to an issue

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)
  text         Comment text

Options:
  --json       Output raw JSON (comment details)
  -h, --help   Show help

Examples:
  linear-cli issue comment ENG-123 "This looks good"
  linear-cli issue comment ENG-123 "Fixed in PR #42" --json`)
}
function getLinearClient() {
  const apiKey = process.env.LINEAR_API_KEY
  if (!apiKey) {
    console.error(`Error: LINEAR_API_KEY not found

Please provide your Linear API key in one of these ways:

1. Environment variable:
   export LINEAR_API_KEY="your-api-key"

2. Create a .env file next to the linear executable:
   echo 'LINEAR_API_KEY=your-api-key' > ${linearDir}/.env

Get your API key from: https://linear.app/settings/api
Go to Settings > API > Personal API keys > Create key`)
    process.exit(1)
  }
  try {
    return new LinearClient({ apiKey })
  } catch (error) {
    console.error(`Error: Failed to initialize Linear client

Make sure @linear/sdk is installed:
  cd linear/
  npm install`)
    process.exit(1)
  }
}
async function listUsers(flags) {
  const client = getLinearClient()
  const users = await client.users()
  if (flags.json) {
    console.log(JSON.stringify(users.nodes, null, 2))
    return
  }
  console.log("Users\n")
  for (const user of users.nodes) {
    console.log(`#${user.id}\t${user.name}\t${user.email}`)
  }
}
async function listTeams(flags) {
  const client = getLinearClient()
  const teams = await client.teams()
  if (flags.json) {
    console.log(JSON.stringify(teams.nodes, null, 2))
    return
  }
  console.log("Teams\n")
  for (const team of teams.nodes) {
    console.log(`#${team.id}\t${team.name}\t${team.key}`)
  }
}
async function listProjects(flags) {
  const client = getLinearClient()
  const projects = await client.projects()
  if (flags.json) {
    console.log(JSON.stringify(projects.nodes, null, 2))
    return
  }
  console.log("Projects\n")
  for (const project of projects.nodes) {
    console.log(`#${project.id}\t${project.name}\t${project.state}`)
  }
}
async function listIssues(flags) {
  const client = getLinearClient()

  // Build filter JSON
  const filter = {}
  if (flags.team) {
    filter.team = { id: { eq: flags.team } }
  }
  if (flags.assignee) {
    filter.assignee = { id: { eq: flags.assignee } }
  }
  if (flags.status) {
    filter.state = { name: { eq: flags.status } }
  }
  const limit = flags.limit ? parseInt(flags.limit, 10) : 50

  // Use GraphQL to preload all relations in a single query
  const graphQLClient = client.client
  const response = await graphQLClient.rawRequest(
    `query listIssues($first: Int!, $filter: IssueFilter, $orderBy: PaginationOrderBy!) {
      issues(first: $first, filter: $filter, orderBy: $orderBy) {
        nodes {
          id
          identifier
          title
          state {
            name
          }
          assignee {
            name
            email
          }
        }
      }
    }`,
    {
      first: limit,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      orderBy: "updatedAt"
    }
  )

  const issues = response.data.issues.nodes

  if (flags.json) {
    console.log(JSON.stringify(issues, null, 2))
    return
  }

  console.log("Issues\n")
  for (const issue of issues) {
    const assigneeName = issue.assignee?.name || "Unassigned"
    console.log(`#${issue.identifier}\t${issue.title}\t${issue.state?.name}\t${assigneeName}`)
  }
}
async function getIssue(identifier, flags) {
  const client = getLinearClient()
  const graphQLClient = client.client

  let issue
  try {
    if (identifier.includes("-")) {
      // Looks like an identifier (ENG-123)
      const [teamKey, issueNumber] = identifier.toUpperCase().split("-")
      const response = await graphQLClient.rawRequest(
        `query getIssueByIdentifier($teamKey: String!, $issueNumber: Float!) {
          issues(filter: { team: { key: { eq: $teamKey } }, number: { eq: $issueNumber } }) {
            nodes {
              id
              identifier
              title
              description
              priority
              createdAt
              updatedAt
              state {
                name
              }
              assignee {
                name
                email
              }
              team {
                name
                key
              }
              labels {
                nodes {
                  name
                }
              }
              comments {
                nodes {
                  body
                  createdAt
                  user {
                    name
                  }
                }
              }
            }
          }
        }`,
        { teamKey, issueNumber: parseInt(issueNumber) }
      )
      issue = response.data.issues.nodes[0]
    } else {
      // Assume it's a UUID
      const response = await graphQLClient.rawRequest(
        `query getIssueById($id: String!) {
          issue(id: $id) {
            id
            identifier
            title
            description
            priority
            createdAt
            updatedAt
            state {
              name
            }
            assignee {
              name
              email
            }
            team {
              name
              key
            }
            labels {
              nodes {
                name
              }
            }
            comments {
              nodes {
                body
                createdAt
                user {
                  name
                }
              }
            }
          }
        }`,
        { id: identifier }
      )
      issue = response.data.issue
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }

  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }

  if (flags.json) {
    console.log(JSON.stringify(issue, null, 2))
    return
  }

  const priorityMap = {
    0: "None",
    1: "Urgent",
    2: "High",
    3: "Medium",
    4: "Low",
  }

  console.log(`Issue: #${issue.identifier}\n`)
  console.log(`Title:\t\t${issue.title}`)
  console.log(`Status:\t\t${issue.state?.name || "Unknown"}`)
  console.log(`Assignee:\t${issue.assignee ? `${issue.assignee.name} (${issue.assignee.email})` : "Unassigned"}`)
  console.log(`Team:\t\t${issue.team.name} (${issue.team.key})`)
  console.log(`Priority:\t${priorityMap[issue.priority] || "None"}`)
  console.log(`Labels:\t\t${issue.labels.nodes.map((l) => l.name).join(", ") || "None"}`)
  console.log(`Created:\t${new Date(issue.createdAt).toISOString().split("T")[0]}`)
  console.log(`Updated:\t${new Date(issue.updatedAt).toISOString().split("T")[0]}`)

  if (issue.description) {
    console.log(`\nDescription:`)
    console.log(issue.description)
  }

  if (issue.comments.nodes.length > 0) {
    console.log(`\nComments:`)
    for (const comment of issue.comments.nodes) {
      const date = new Date(comment.createdAt).toISOString().split("T")[0]
      console.log(`  [${date}] ${comment.user?.name}: ${comment.body}`)
    }
  }
}
async function addComment(identifier, text, flags) {
  const client = getLinearClient()
  // Find issue first
  let issue
  try {
    if (identifier.includes("-")) {
      const issues = await client.issues({ filter: { number: { eq: parseInt(identifier.split("-")[1]) } } })
      issue = issues.nodes.find((i) => i.identifier === identifier.toUpperCase())
    } else {
      issue = await client.issue(identifier)
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  const response = await client.createComment({
    issueId: issue.id,
    body: text,
  })
  const comment = await response.comment
  if (flags.json) {
    console.log(JSON.stringify(comment, null, 2))
    return
  }
  console.log(`✓ Comment added to #${issue.identifier}`)
}
async function updateIssue(identifier, flags) {
  const client = getLinearClient()
  // Find issue first
  let issue
  try {
    if (identifier.includes("-")) {
      const issues = await client.issues({ filter: { number: { eq: parseInt(identifier.split("-")[1]) } } })
      issue = issues.nodes.find((i) => i.identifier === identifier.toUpperCase())
    } else {
      issue = await client.issue(identifier)
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  const updates = {}
  if (flags.status) {
    // Find state by name
    const team = await issue.team
    const states = await team.states()
    const state = states.nodes.find((s) => s.name.toLowerCase() === flags.status.toLowerCase())
    if (state) {
      updates.stateId = state.id
    } else {
      console.error(`Error: Status '${flags.status}' not found`)
      process.exit(1)
    }
  }
  if (flags.assignee) {
    updates.assigneeId = flags.assignee
  }
  if (flags.priority !== undefined) {
    updates.priority = parseInt(flags.priority, 10)
  }
  if (flags.title) {
    updates.title = flags.title
  }
  if (flags.description) {
    updates.description = flags.description
  }
  if (Object.keys(updates).length === 0) {
    console.error(`Error: No updates specified

Run 'linear-cli update --help' for available options`)
    process.exit(1)
  }
  const response = await client.updateIssue(issue.id, updates)
  const updatedIssue = await response.issue
  if (flags.json) {
    console.log(JSON.stringify(updatedIssue, null, 2))
    return
  }
  console.log(`✓ Issue #${issue.identifier} updated`)
}
async function createIssue(title, flags) {
  const client = getLinearClient()
  if (!flags.team) {
    console.error(`Error: --team flag is required

Run 'linear-cli create --help' for usage`)
    process.exit(1)
  }
  const input = {
    teamId: flags.team,
    title,
  }
  if (flags.description) {
    input.description = flags.description
  }
  if (flags.assignee) {
    input.assigneeId = flags.assignee
  }
  if (flags.priority !== undefined) {
    input.priority = parseInt(flags.priority, 10)
  }
  if (flags.status) {
    // Find state by name
    const team = await client.team(flags.team)
    const states = await team.states()
    const state = states.nodes.find((s) => s.name.toLowerCase() === flags.status.toLowerCase())
    if (state) {
      input.stateId = state.id
    } else {
      console.error(`Error: Status '${flags.status}' not found`)
      process.exit(1)
    }
  }
  const response = await client.createIssue(input)
  const issue = await response.issue
  if (!issue) {
    console.error("Error: Failed to create issue")
    process.exit(1)
  }
  if (flags.json) {
    console.log(JSON.stringify(issue, null, 2))
    return
  }
  console.log(`✓ Issue created: #${issue.identifier}`)
  console.log(`  Title: ${issue.title}`)
  console.log(`  URL: ${issue.url}`)
}
async function deleteIssue(identifier, flags) {
  const client = getLinearClient()
  // Find issue first
  let issue
  try {
    if (identifier.includes("-")) {
      const issues = await client.issues({ filter: { number: { eq: parseInt(identifier.split("-")[1]) } } })
      issue = issues.nodes.find((i) => i.identifier === identifier.toUpperCase())
    } else {
      issue = await client.issue(identifier)
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`)
    process.exit(1)
  }
  const response = await client.deleteIssue(issue.id)
  const success = await response.success
  if (flags.json) {
    console.log(JSON.stringify({ success }, null, 2))
    return
  }
  if (success) {
    console.log(`✓ Issue #${issue.identifier} deleted (moved to trash)`)
  } else {
    console.error(`Error: Failed to delete issue #${issue.identifier}`)
    process.exit(1)
  }
}
async function main() {
  const { resource, action, args, flags } = parseArgs(process.argv)

  // Handle help flags
  if (flags.h || flags.help) {
    if (!resource) {
      showHelp()
      process.exit(0)
    }

    switch (resource) {
      case "user":
        showUserHelp()
        break
      case "team":
        showTeamHelp()
        break
      case "project":
        showProjectHelp()
        break
      case "issue":
        if (!action) {
          showIssueHelp()
        } else {
          switch (action) {
            case "list":
              showIssueListHelp()
              break
            case "view":
              showIssueViewHelp()
              break
            case "create":
              showIssueCreateHelp()
              break
            case "update":
              showIssueUpdateHelp()
              break
            case "delete":
              showIssueDeleteHelp()
              break
            case "comment":
              showIssueCommentHelp()
              break
            default:
              showIssueHelp()
          }
        }
        break
      default:
        showHelp()
    }
    process.exit(0)
  }

  try {
    // Route commands
    switch (resource) {
      case "user":
        if (action === "list") {
          await listUsers(flags)
        } else {
          console.error(`Error: Unknown action '${action}' for resource 'user'

Run 'linear-cli user --help' for usage`)
          process.exit(1)
        }
        break

      case "team":
        if (action === "list") {
          await listTeams(flags)
        } else {
          console.error(`Error: Unknown action '${action}' for resource 'team'

Run 'linear-cli team --help' for usage`)
          process.exit(1)
        }
        break

      case "project":
        if (action === "list") {
          await listProjects(flags)
        } else {
          console.error(`Error: Unknown action '${action}' for resource 'project'

Run 'linear-cli project --help' for usage`)
          process.exit(1)
        }
        break

      case "issue":
        switch (action) {
          case "list":
            await listIssues(flags)
            break

          case "view":
            if (args.length === 0) {
              console.error(`Error: Missing issue identifier

Run 'linear-cli issue view --help' for usage`)
              process.exit(1)
            }
            await getIssue(args[0], flags)
            break

          case "create":
            if (args.length === 0) {
              console.error(`Error: Missing issue title

Run 'linear-cli issue create --help' for usage`)
              process.exit(1)
            }
            await createIssue(args.join(" "), flags)
            break

          case "update":
            if (args.length === 0) {
              console.error(`Error: Missing issue identifier

Run 'linear-cli issue update --help' for usage`)
              process.exit(1)
            }
            await updateIssue(args[0], flags)
            break

          case "delete":
            if (args.length === 0) {
              console.error(`Error: Missing issue identifier

Run 'linear-cli issue delete --help' for usage`)
              process.exit(1)
            }
            await deleteIssue(args[0], flags)
            break

          case "comment":
            if (args.length < 2) {
              console.error(`Error: Missing required arguments

Run 'linear-cli issue comment --help' for usage`)
              process.exit(1)
            }
            await addComment(args[0], args.slice(1).join(" "), flags)
            break

          default:
            if (action) {
              console.error(`Error: Unknown action '${action}' for resource 'issue'

Run 'linear-cli issue --help' for usage`)
            } else {
              console.error(`Error: Missing action for resource 'issue'

Run 'linear-cli issue --help' for usage`)
            }
            process.exit(1)
        }
        break

      default:
        if (resource) {
          console.error(`Error: Unknown resource '${resource}'

Run 'linear-cli --help' for usage`)
          process.exit(1)
        } else {
          showHelp()
        }
    }
  } catch (error) {
    if (error.message?.includes("API key")) {
      console.error(`Error: Invalid LINEAR_API_KEY

Check your API key is valid: https://linear.app/settings/api`)
    } else {
      console.error(`Error: ${error.message || "Unknown error occurred"}`)
    }
    process.exit(1)
  }
}
main()
