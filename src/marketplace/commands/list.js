'use strict';

const fs = require('fs');
const path = require('path');
const log = require('../utils/log');
const { readSkillPackage } = require('../core/skill-package');
const { readLockfile } = require('../core/lockfile');

/**
 * List installed skills.
 */
async function run(args, flags) {
  const projectDir = process.cwd();
  const skillsDir = path.join(projectDir, '.claude', 'skills');

  if (!fs.existsSync(skillsDir)) {
    log.warn('未找到 .claude/skills/ 目录');
    log.info('请先运行 npx sdd-workflow 安装 SDD 工作流');
    return;
  }

  const lockfile = readLockfile(projectDir);
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(e => e.isDirectory());

  const skillDirs = [];
  for (const entry of entries) {
    const skillDir = path.join(skillsDir, entry.name);
    if (fs.existsSync(path.join(skillDir, 'SKILL.md'))) {
      skillDirs.push(skillDir);
    }
  }

  if (skillDirs.length === 0) {
    log.info('当前项目没有安装任何 skill');
    return;
  }

  log.header(`已安装的 Skills (${skillDirs.length})`);

  const rows = [];
  for (const skillDir of skillDirs) {
    const pkg = readSkillPackage(skillDir);
    const lockEntry = lockfile ? lockfile.skills[pkg.name] : null;

    rows.push({
      name: pkg.name,
      version: pkg.version || 'unknown',
      source: lockEntry ? lockEntry.source : 'manual',
      description: truncate(pkg.description, 30),
    });

    if (flags.verbose) {
      log.info(`  ${pkg.name}@${pkg.version}`);
      log.dim(`    描述: ${pkg.description || '无'}`);
      log.dim(`    作者: ${pkg.author || '未知'}`);
      log.dim(`    来源: ${lockEntry ? lockEntry.source : '手动安装'}`);
      log.dim(`    安装时间: ${lockEntry ? lockEntry.installedAt : '未知'}`);
      if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
        log.dim(`    依赖: ${Object.keys(pkg.dependencies).join(', ')}`);
      }
      log.dim(`    文件数: ${pkg.files.length}`);
      console.log('');
    }
  }

  if (!flags.verbose) {
    log.table(rows, [
      { key: 'name', label: '名称' },
      { key: 'version', label: '版本' },
      { key: 'source', label: '来源' },
      { key: 'description', label: '描述' },
    ]);
    console.log('');
    log.dim('使用 --verbose 查看详细信息');
  }
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len - 1) + '…' : str;
}

module.exports = { run };
