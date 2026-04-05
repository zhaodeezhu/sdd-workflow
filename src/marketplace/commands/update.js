'use strict';

const fs = require('fs');
const path = require('path');
const log = require('../utils/log');
const { readLockfile, writeLockfile, getSkillEntry, generateSkillHash } = require('../core/lockfile');
const { readSkillPackage } = require('../core/skill-package');
const { copyDirectory, ensureDir, removeDirectory } = require('../utils/fs');

/**
 * Update installed skills.
 */
async function run(args, flags) {
  const targetSkill = args[0]; // Optional: specific skill name
  const projectDir = process.cwd();
  const lockfile = readLockfile(projectDir);

  if (!lockfile || !lockfile.skills || Object.keys(lockfile.skills).length === 0) {
    log.warn('没有已安装的 skills');
    log.info('运行 sdd list 查看已安装的 skills');
    return;
  }

  let skillsToUpdate;
  if (targetSkill) {
    const entry = getSkillEntry(lockfile, targetSkill);
    if (!entry) {
      log.error(`未安装的 skill: ${targetSkill}`);
      process.exit(1);
    }
    skillsToUpdate = { [targetSkill]: entry };
  } else {
    skillsToUpdate = lockfile.skills;
  }

  log.header('更新 Skills');

  const stats = { updated: 0, upToDate: 0, failed: 0 };

  for (const [name, entry] of Object.entries(skillsToUpdate)) {
    log.info(`检查 ${name}...`);

    // Check if skill directory exists
    const skillDir = path.join(projectDir, '.claude', 'skills', name);
    if (!fs.existsSync(skillDir)) {
      log.warn(`  ${name}: 目录不存在，跳过`);
      stats.failed++;
      continue;
    }

    // For builtin skills, check if source has updates
    if (entry.source === 'builtin' || entry.source.startsWith('local:')) {
      // For builtin/local skills, we can only check if the install hash matches
      const currentHash = generateSkillHash(skillDir);
      if (currentHash !== entry.contentHash) {
        log.warn(`  ${name}: 已被本地修改`);
        stats.upToDate++;
      } else {
        log.success(`  ${name}: 已是最新`);
        stats.upToDate++;
      }
      continue;
    }

    // For GitHub/registry skills, try to fetch latest version
    try {
      const { resolveSource } = require('./install');
      const source = require('../core/source');
      const resolved = resolveSource(entry.source);

      if (resolved.type === 'github') {
        log.info(`  从 GitHub 获取最新版本...`);
        const latestDir = await source.fetchGithubSkill(resolved);
        const latestPkg = readSkillPackage(latestDir);

        if (latestPkg.version === entry.version) {
          log.success(`  ${name}: 已是最新 (${entry.version})`);
          stats.upToDate++;
        } else {
          log.info(`  更新 ${name}: ${entry.version} → ${latestPkg.version}`);
          if (!flags.dryRun) {
            // Backup and replace
            const backupDir = skillDir + '.bak';
            fs.renameSync(skillDir, backupDir);

            try {
              ensureDir(skillDir);
              copyDirectory(latestDir, skillDir, { force: true });

              // Update lockfile
              const newHash = generateSkillHash(skillDir);
              entry.version = latestPkg.version;
              entry.contentHash = newHash;
              entry.installedAt = new Date().toISOString();

              removeDirectory(backupDir);
              log.success(`  ${name}: 更新成功`);
              stats.updated++;
            } catch (e) {
              // Restore backup
              removeDirectory(skillDir);
              fs.renameSync(backupDir, skillDir);
              throw e;
            }
          } else {
            log.info(`  [dry-run] 将更新 ${name}`);
            stats.updated++;
          }
        }

        removeDirectory(latestDir);
      } else {
        log.warn(`  ${name}: 不支持的来源类型 (${resolved.type})`);
        stats.failed++;
      }
    } catch (e) {
      log.error(`  ${name}: 更新失败 - ${e.message}`);
      stats.failed++;
    }
  }

  // Save lockfile
  if (stats.updated > 0 && !flags.dryRun) {
    writeLockfile(projectDir, lockfile);
  }

  console.log('');
  log.header('更新摘要');
  log.info(`  已更新: ${stats.updated}`);
  log.info(`  已最新: ${stats.upToDate}`);
  if (stats.failed > 0) {
    log.warn(`  失败: ${stats.failed}`);
  }
}

module.exports = { run };
