#!/usr/bin/env node

/**
 * SDD Workflow - Installation CLI
 *
 * Usage:
 *   npx sdd-workflow              # Install SDD workflow to current project
 *   npx sdd-workflow --force      # Overwrite existing files
 *   npx sdd-workflow --dry-run    # Preview what would be installed
 *   npx sdd-workflow --update     # Incremental update (only changed files)
 *   npx sdd-workflow --update --dry-run  # Preview updates
 */

const path = require('path');
const fs = require('fs');
const { install } = require('../src/installer');

const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  dryRun: args.includes('--dry-run'),
  update: args.includes('--update'),
  help: args.includes('--help') || args.includes('-h'),
};

if (options.help) {
  console.log(`
SDD Workflow Installer

Usage:
  npx sdd-workflow              Install SDD workflow to current project
  npx sdd-workflow --force      Overwrite all existing files
  npx sdd-workflow --dry-run    Preview what would be installed
  npx sdd-workflow --update     Incremental update (only changed files)
  npx sdd-workflow --update --dry-run  Preview what would be updated

What gets installed:
  .claude/skills/sdd-*/     10 SDD skills for Claude Code
  .specify/                 Templates, scripts, and specs directory
  .claude/teams/            Team configuration templates

Update modes:
  (default)     Skip existing files (safe, non-destructive)
  --update      Smart update: auto-update source-changed files, skip user-customized files
  --force       Overwrite everything (resets to default, loses customizations)

After installation:
  1. Open Claude Code in your project
  2. Run /sdd-init to generate project constitution
  3. Start using SDD workflow with /sdd-specify, /sdd-plan, etc.
`);
  process.exit(0);
}

const targetDir = process.cwd();
install(targetDir, options).catch((err) => {
  console.error('Installation failed:', err.message);
  process.exit(1);
});
