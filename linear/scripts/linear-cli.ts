#!/usr/bin/env node

import { LinearClient } from '@linear/sdk';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the linear executable (parent of scripts/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const linearDir = join(__dirname, '..');

// Load environment variables from .env file next to linear executable
config({ path: join(linearDir, '.env') });

interface CliArgs {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): CliArgs {
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};
  let command = '';

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = argv[i + 1];

      if (nextArg && !nextArg.startsWith('-')) {
        flags[key] = nextArg;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith('-')) {
      flags[arg.slice(1)] = true;
    } else if (!command) {
      command = arg;
    } else {
      args.push(arg);
    }
  }

  return { command, args, flags };
}

function showHelp() {
  console.log(`linear-cli - CLI for working with Linear issues

Usage: linear-cli <command> [options]

Commands:
  users                          List all users
  teams                          List all teams
  projects                       List all projects
  issues [options]               List issues with filters
  issue <id-or-key>              Get issue details
  create <title> [options]       Create a new issue
  comment <id-or-key> <text>     Add comment to issue
  update <id-or-key> [options]   Update issue fields
  delete <id-or-key>             Delete an issue

Global Options:
  -h, --help                     Show help
  --json                         Output raw JSON

Run 'linear-cli <command> --help' for command-specific help`);
}

function showUsersHelp() {
  console.log(`Usage: linear-cli users [options]

List all users

Options:
  --json    Output raw JSON
  -h, --help    Show help`);
}

function showTeamsHelp() {
  console.log(`Usage: linear-cli teams [options]

List all teams

Options:
  --json    Output raw JSON
  -h, --help    Show help`);
}

function showProjectsHelp() {
  console.log(`Usage: linear-cli projects [options]

List all projects

Options:
  --json    Output raw JSON
  -h, --help    Show help`);
}

function showIssuesHelp() {
  console.log(`Usage: linear-cli issues [options]

List issues with filters

Options:
  --team <id>       Filter by team ID
  --assignee <id>   Filter by assignee user ID
  --status <name>   Filter by status name
  --limit <n>       Limit results (default: 50)
  --json            Output raw JSON
  -h, --help        Show help`);
}

function showIssueHelp() {
  console.log(`Usage: linear-cli issue <id-or-key> [options]

Get detailed information about an issue

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)

Options:
  --json       Output raw JSON
  -h, --help   Show help`);
}

function showCommentHelp() {
  console.log(`Usage: linear-cli comment <id-or-key> <text> [options]

Add a comment to an issue

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)
  text         Comment text

Options:
  --json       Output raw JSON (comment details)
  -h, --help   Show help`);
}

function showUpdateHelp() {
  console.log(`Usage: linear-cli update <id-or-key> [options]

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
  -h, --help        Show help`);
}

function showCreateHelp() {
  console.log(`Usage: linear-cli create <title> [options]

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
  -h, --help            Show help`);
}

function showDeleteHelp() {
  console.log(`Usage: linear-cli delete <id-or-key> [options]

Delete an issue (moves to trash)

Arguments:
  id-or-key    Issue identifier (e.g., ENG-123 or full UUID)

Options:
  --json       Output raw JSON
  -h, --help   Show help`);
}

function getLinearClient(): LinearClient {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    console.error(`Error: LINEAR_API_KEY not found

Please provide your Linear API key in one of these ways:

1. Environment variable:
   export LINEAR_API_KEY="your-api-key"

2. Create a .env file next to the linear executable:
   echo 'LINEAR_API_KEY=your-api-key' > ${linearDir}/.env

Get your API key from: https://linear.app/settings/api
Go to Settings > API > Personal API keys > Create key`);
    process.exit(1);
  }

  try {
    return new LinearClient({ apiKey });
  } catch (error) {
    console.error(`Error: Failed to initialize Linear client

Make sure @linear/sdk is installed:
  cd linear/
  npm install`);
    process.exit(1);
  }
}

async function listUsers(flags: Record<string, string | boolean>) {
  const client = getLinearClient();
  const users = await client.users();

  if (flags.json) {
    console.log(JSON.stringify(users.nodes, null, 2));
    return;
  }

  console.log('Users\n');
  for (const user of users.nodes) {
    console.log(`#${user.id}\t${user.name}\t${user.email}`);
  }
}

async function listTeams(flags: Record<string, string | boolean>) {
  const client = getLinearClient();
  const teams = await client.teams();

  if (flags.json) {
    console.log(JSON.stringify(teams.nodes, null, 2));
    return;
  }

  console.log('Teams\n');
  for (const team of teams.nodes) {
    console.log(`#${team.id}\t${team.name}\t${team.key}`);
  }
}

async function listProjects(flags: Record<string, string | boolean>) {
  const client = getLinearClient();
  const projects = await client.projects();

  if (flags.json) {
    console.log(JSON.stringify(projects.nodes, null, 2));
    return;
  }

  console.log('Projects\n');
  for (const project of projects.nodes) {
    console.log(`#${project.id}\t${project.name}\t${project.state}`);
  }
}

async function listIssues(flags: Record<string, string | boolean>) {
  const client = getLinearClient();

  const filter: any = {};

  if (flags.team) {
    filter.team = { id: { eq: flags.team as string } };
  }

  if (flags.assignee) {
    filter.assignee = { id: { eq: flags.assignee as string } };
  }

  if (flags.status) {
    filter.state = { name: { eq: flags.status as string } };
  }

  const limit = flags.limit ? parseInt(flags.limit as string, 10) : 50;

  const issues = await client.issues({
    first: limit,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    orderBy: 'updatedAt' as any,
  });

  if (flags.json) {
    console.log(JSON.stringify(issues.nodes, null, 2));
    return;
  }

  console.log('Issues\n');
  for (const issue of issues.nodes) {
    const state = await issue.state;
    const assignee = await issue.assignee;
    const assigneeName = assignee?.name || 'Unassigned';
    console.log(`#${issue.identifier}\t${issue.title}\t${state?.name}\t${assigneeName}`);
  }
}

async function getIssue(identifier: string, flags: Record<string, string | boolean>) {
  const client = getLinearClient();

  // Try to find issue by identifier (e.g., ENG-123) or ID
  let issue;
  try {
    if (identifier.includes('-')) {
      // Looks like an identifier (ENG-123)
      const issues = await client.issues({ filter: { number: { eq: parseInt(identifier.split('-')[1]) } } });
      issue = issues.nodes.find(i => i.identifier === identifier.toUpperCase());
    } else {
      // Assume it's a UUID
      issue = await client.issue(identifier);
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`);
    process.exit(1);
  }

  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`);
    process.exit(1);
  }

  if (flags.json) {
    console.log(JSON.stringify(issue, null, 2));
    return;
  }

  const state = await issue.state;
  const assignee = await issue.assignee;
  const team = await issue.team;
  const labels = await issue.labels();
  const comments = await issue.comments();

  const priorityMap: Record<number, string> = {
    0: 'None',
    1: 'Urgent',
    2: 'High',
    3: 'Medium',
    4: 'Low',
  };

  console.log(`Issue: #${issue.identifier}\n`);
  console.log(`Title:\t\t${issue.title}`);
  console.log(`Status:\t\t${state?.name || 'Unknown'}`);
  console.log(`Assignee:\t${assignee ? `${assignee.name} (${assignee.email})` : 'Unassigned'}`);
  console.log(`Team:\t\t${team.name} (${team.key})`);
  console.log(`Priority:\t${priorityMap[issue.priority] || 'None'}`);
  console.log(`Labels:\t\t${labels.nodes.map(l => l.name).join(', ') || 'None'}`);
  console.log(`Created:\t${issue.createdAt.toISOString().split('T')[0]}`);
  console.log(`Updated:\t${issue.updatedAt.toISOString().split('T')[0]}`);

  if (issue.description) {
    console.log(`\nDescription:`);
    console.log(issue.description);
  }

  if (comments.nodes.length > 0) {
    console.log(`\nComments:`);
    for (const comment of comments.nodes) {
      const user = await comment.user;
      const date = comment.createdAt.toISOString().split('T')[0];
      console.log(`  [${date}] ${user?.name}: ${comment.body}`);
    }
  }
}

async function addComment(identifier: string, text: string, flags: Record<string, string | boolean>) {
  const client = getLinearClient();

  // Find issue first
  let issue;
  try {
    if (identifier.includes('-')) {
      const issues = await client.issues({ filter: { number: { eq: parseInt(identifier.split('-')[1]) } } });
      issue = issues.nodes.find(i => i.identifier === identifier.toUpperCase());
    } else {
      issue = await client.issue(identifier);
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`);
    process.exit(1);
  }

  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`);
    process.exit(1);
  }

  const response = await client.createComment({
    issueId: issue.id,
    body: text,
  });

  const comment = await response.comment;

  if (flags.json) {
    console.log(JSON.stringify(comment, null, 2));
    return;
  }

  console.log(`✓ Comment added to #${issue.identifier}`);
}

async function updateIssue(identifier: string, flags: Record<string, string | boolean>) {
  const client = getLinearClient();

  // Find issue first
  let issue;
  try {
    if (identifier.includes('-')) {
      const issues = await client.issues({ filter: { number: { eq: parseInt(identifier.split('-')[1]) } } });
      issue = issues.nodes.find(i => i.identifier === identifier.toUpperCase());
    } else {
      issue = await client.issue(identifier);
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`);
    process.exit(1);
  }

  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`);
    process.exit(1);
  }

  const updates: any = {};

  if (flags.status) {
    // Find state by name
    const team = await issue.team;
    const states = await team.states();
    const state = states.nodes.find(s => s.name.toLowerCase() === (flags.status as string).toLowerCase());

    if (state) {
      updates.stateId = state.id;
    } else {
      console.error(`Error: Status '${flags.status}' not found`);
      process.exit(1);
    }
  }

  if (flags.assignee) {
    updates.assigneeId = flags.assignee as string;
  }

  if (flags.priority !== undefined) {
    updates.priority = parseInt(flags.priority as string, 10);
  }

  if (flags.title) {
    updates.title = flags.title as string;
  }

  if (flags.description) {
    updates.description = flags.description as string;
  }

  if (Object.keys(updates).length === 0) {
    console.error(`Error: No updates specified

Run 'linear-cli update --help' for available options`);
    process.exit(1);
  }

  const response = await client.updateIssue(issue.id, updates);
  const updatedIssue = await response.issue;

  if (flags.json) {
    console.log(JSON.stringify(updatedIssue, null, 2));
    return;
  }

  console.log(`✓ Issue #${issue.identifier} updated`);
}

async function createIssue(title: string, flags: Record<string, string | boolean>) {
  const client = getLinearClient();

  if (!flags.team) {
    console.error(`Error: --team flag is required

Run 'linear-cli create --help' for usage`);
    process.exit(1);
  }

  const input: any = {
    teamId: flags.team as string,
    title,
  };

  if (flags.description) {
    input.description = flags.description as string;
  }

  if (flags.assignee) {
    input.assigneeId = flags.assignee as string;
  }

  if (flags.priority !== undefined) {
    input.priority = parseInt(flags.priority as string, 10);
  }

  if (flags.status) {
    // Find state by name
    const team = await client.team(flags.team as string);
    const states = await team.states();
    const state = states.nodes.find(s => s.name.toLowerCase() === (flags.status as string).toLowerCase());

    if (state) {
      input.stateId = state.id;
    } else {
      console.error(`Error: Status '${flags.status}' not found`);
      process.exit(1);
    }
  }

  const response = await client.createIssue(input);
  const issue = await response.issue;

  if (!issue) {
    console.error('Error: Failed to create issue');
    process.exit(1);
  }

  if (flags.json) {
    console.log(JSON.stringify(issue, null, 2));
    return;
  }

  console.log(`✓ Issue created: #${issue.identifier}`);
  console.log(`  Title: ${issue.title}`);
  console.log(`  URL: ${issue.url}`);
}

async function deleteIssue(identifier: string, flags: Record<string, string | boolean>) {
  const client = getLinearClient();

  // Find issue first
  let issue;
  try {
    if (identifier.includes('-')) {
      const issues = await client.issues({ filter: { number: { eq: parseInt(identifier.split('-')[1]) } } });
      issue = issues.nodes.find(i => i.identifier === identifier.toUpperCase());
    } else {
      issue = await client.issue(identifier);
    }
  } catch (error) {
    console.error(`Error: Issue not found: ${identifier}`);
    process.exit(1);
  }

  if (!issue) {
    console.error(`Error: Issue not found: ${identifier}`);
    process.exit(1);
  }

  const response = await client.deleteIssue(issue.id);
  const success = await response.success;

  if (flags.json) {
    console.log(JSON.stringify({ success }, null, 2));
    return;
  }

  if (success) {
    console.log(`✓ Issue #${issue.identifier} deleted (moved to trash)`);
  } else {
    console.error(`Error: Failed to delete issue #${issue.identifier}`);
    process.exit(1);
  }
}

async function main() {
  const { command, args, flags } = parseArgs(process.argv);

  if (flags.h || flags.help) {
    switch (command) {
      case 'users':
        showUsersHelp();
        break;
      case 'teams':
        showTeamsHelp();
        break;
      case 'projects':
        showProjectsHelp();
        break;
      case 'issues':
        showIssuesHelp();
        break;
      case 'issue':
        showIssueHelp();
        break;
      case 'create':
        showCreateHelp();
        break;
      case 'comment':
        showCommentHelp();
        break;
      case 'update':
        showUpdateHelp();
        break;
      case 'delete':
        showDeleteHelp();
        break;
      default:
        showHelp();
    }
    process.exit(0);
  }

  try {
    switch (command) {
      case 'users':
        await listUsers(flags);
        break;
      case 'teams':
        await listTeams(flags);
        break;
      case 'projects':
        await listProjects(flags);
        break;
      case 'issues':
        await listIssues(flags);
        break;
      case 'issue':
        if (args.length === 0) {
          console.error(`Error: Missing issue identifier

Run 'linear-cli issue --help' for usage`);
          process.exit(1);
        }
        await getIssue(args[0], flags);
        break;
      case 'comment':
        if (args.length < 2) {
          console.error(`Error: Missing required arguments

Run 'linear-cli comment --help' for usage`);
          process.exit(1);
        }
        await addComment(args[0], args.slice(1).join(' '), flags);
        break;
      case 'create':
        if (args.length === 0) {
          console.error(`Error: Missing issue title

Run 'linear-cli create --help' for usage`);
          process.exit(1);
        }
        await createIssue(args.join(' '), flags);
        break;
      case 'update':
        if (args.length === 0) {
          console.error(`Error: Missing issue identifier

Run 'linear-cli update --help' for usage`);
          process.exit(1);
        }
        await updateIssue(args[0], flags);
        break;
      case 'delete':
        if (args.length === 0) {
          console.error(`Error: Missing issue identifier

Run 'linear-cli delete --help' for usage`);
          process.exit(1);
        }
        await deleteIssue(args[0], flags);
        break;
      default:
        if (command) {
          console.error(`Error: Unknown command '${command}'

Run 'linear-cli --help' for usage`);
          process.exit(1);
        } else {
          showHelp();
        }
    }
  } catch (error: any) {
    if (error.message?.includes('API key')) {
      console.error(`Error: Invalid LINEAR_API_KEY

Check your API key is valid: https://linear.app/settings/api`);
    } else {
      console.error(`Error: ${error.message || 'Unknown error occurred'}`);
    }
    process.exit(1);
  }
}

main();
