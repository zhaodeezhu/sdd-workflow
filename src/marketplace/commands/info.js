'use strict';

const fs = require('fs');
const path = require('path');
const log = require('../utils/log');
const { readSkillPackage } = require('../core/skill-package');
const { readLockfile, getSkillEntry } = require('../core/lockfile');
const { getSkill } = require('../core/registry');

/**
 * Show detailed info about a skill.
 */
async function run(args, flags) {
  const name = args[0];

  if (!name) {
    log.error('请指定 skill 名称');
    log.info('用法: sdd info <skill-name>');
    process.exit(1);
  }

  const projectDir = process.cwd();

  // Try local first
  const localDir = path.join(projectDir, '.claude', 'skills', name);
  let pkg = null;
  let lockEntry = null;

  if (fs.existsSync(localDir)) {
    pkg = readSkillPackage(localDir);
    const lockfile = readLockfile(projectDir);
    lockEntry = getSkillEntry(lockfile, name);
  }

  // If not found locally, try registry
  if (!pkg) {
    try {
      const registryEntry = await getSkill(name);
      if (registryEntry) {
        pkg = registryEntry;
        pkg.hasManifest = true;
        pkg._source = 'registry';
      }
    } catch (e) {
      // Registry not available
    }
  }

  if (!pkg) {
    log.error(`未找到 skill: ${name}`);
    log.info('请检查名称是否正确，或使用 sdd search 搜索');
    process.exit(1);
  }

  log.header(`Skill 详情: ${pkg.name}`);

  log.info(`  名称:      ${pkg.name}`);
  log.info(`  版本:      ${pkg.version || 'unknown'}`);
  log.info(`  描述:      ${pkg.description || '无'}`);
  log.info(`  作者:      ${pkg.author || '未知'}`);
  log.info(`  许可证:    ${pkg.license || 'MIT'}`);
  log.info(`  分类:      ${pkg.category || 'custom'}`);
  log.info(`  关键词:    ${(pkg.keywords || []).join(', ') || '无'}`);
  console.log('');

  if (pkg.sddVersion) {
    log.info(`  兼容版本:  ${pkg.sddVersion}`);
  }

  if (lockEntry) {
    log.info(`  安装来源:  ${lockEntry.source}`);
    log.info(`  安装时间:  ${lockEntry.installedAt}`);
  }

  if (pkg._source === 'registry') {
    log.info(`  来源:      注册表`);
    if (pkg.sourceUrl) {
      log.info(`  仓库:      ${pkg.sourceUrl}`);
    }
  }

  console.log('');

  if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
    log.info('  依赖:');
    for (const [dep, ver] of Object.entries(pkg.dependencies)) {
      log.info(`    - ${dep}@${ver}`);
    }
  } else {
    log.info('  依赖: 无');
  }

  console.log('');
}

module.exports = { run };
