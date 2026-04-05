'use strict';

const fs = require('fs');
const path = require('path');
const log = require('../utils/log');
const { readLockfile, writeLockfile, createEmptyLockfile, removeSkillEntry, getReverseDependencies, isInstalled } = require('../core/lockfile');

/**
 * Uninstall a skill.
 */
async function run(args, flags) {
  const name = args[0];

  if (!name) {
    log.error('请指定要卸载的 skill 名称');
    log.info('用法: sdd uninstall <skill-name>');
    process.exit(1);
  }

  const projectDir = process.cwd();
  const lockfile = readLockfile(projectDir) || createEmptyLockfile();

  // Check if installed
  if (!isInstalled(lockfile, name)) {
    // Also check if directory exists even without lockfile entry
    const skillDir = path.join(projectDir, '.claude', 'skills', name);
    if (!fs.existsSync(skillDir)) {
      log.error(`未安装的 skill: ${name}`);
      process.exit(1);
    }
    // Directory exists but no lockfile entry - proceed anyway
  }

  // Check reverse dependencies
  const dependents = getReverseDependencies(lockfile, name);
  if (dependents.length > 0 && !flags.force) {
    log.warn(`以下 skills 依赖于 ${name}:`);
    for (const dep of dependents) {
      log.warn(`  - ${dep}`);
    }
    log.info('使用 --force 强制卸载（可能导致依赖的 skills 无法正常工作）');
    process.exit(1);
  }

  // Remove skill directory
  const skillDir = path.join(projectDir, '.claude', 'skills', name);
  if (fs.existsSync(skillDir)) {
    fs.rmSync(skillDir, { recursive: true, force: true });
  }

  // Update lockfile
  removeSkillEntry(lockfile, name);
  writeLockfile(projectDir, lockfile);

  log.success(`Skill ${name} 已卸载`);

  if (dependents.length > 0) {
    log.warn('注意: 以下 skills 仍依赖已卸载的 skill:');
    for (const dep of dependents) {
      log.warn(`  - ${dep}`);
    }
  }
}

module.exports = { run };
