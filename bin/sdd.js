#!/usr/bin/env node

/**
 * SDD Skill Marketplace CLI
 *
 * Usage:
 *   sdd install <source>     Install a skill (local path, GitHub, or registry name)
 *   sdd uninstall <name>     Uninstall a skill
 *   sdd list [--verbose]     List installed skills
 *   sdd search <keyword>     Search registry for skills
 *   sdd publish              Publish current skill to registry
 *   sdd info <name>          Show skill details
 *   sdd update [name]        Update installed skills
 *   sdd validate [path]      Validate a skill package
 *   sdd create <name>        Scaffold a new skill
 */

const { run } = require('../src/marketplace/cli');
run(process.argv.slice(2));
