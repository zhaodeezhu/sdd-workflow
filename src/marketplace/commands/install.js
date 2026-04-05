'use strict';

const fs = require('fs');
const path = require('path');
const log = require('../utils/log');
const { copyDirectory, ensureDir, collectFiles, hashDirectory } = require('../utils/fs');
const { readSkillPackage, validateSkillPackage } = require('../core/skill-package');
const {
  readLockfile, writeLockfile, createEmptyLockfile,
  addSkillEntry, isInstalled, generateSkillHash,
} = require('../core/lockfile');

/**
 * Install a skill from a source (local path, GitHub, or registry name).
 */
async function run(args, flags) {
  const source = args[0];

  if (!source) {
    log.error('请指定要安装的 skill 来源');
    log.info('用法: sdd install <source>');
    log.info('  sdd install ./local-path           从本地路径安装');
    log.info('  sdd install github:user/repo/path   从 GitHub 安装');
    log.info('  sdd install skill-name              从注册表安装');
    process.exit(1);
  }

  const projectDir = process.cwd();

  // Resolve source type
  const resolved = resolveSource(source);
  log.info(`来源类型: ${resolved.type}`);

  switch (resolved.type) {
    case 'local':
      await installFromLocal(resolved.path, projectDir, flags);
      break;
    case 'github':
      await installFromGithub(resolved, projectDir, flags);
      break;
    case 'registry':
      await installFromRegistry(resolved.name, projectDir, flags);
      break;
    default:
      log.error(`不支持的来源类型: ${resolved.type}`);
      process.exit(1);
  }
}

/**
 * Resolve source specifier into type + details.
 */
function resolveSource(source) {
  // Local path
  if (source.startsWith('./') || source.startsWith('../') || source.startsWith('/')) {
    return { type: 'local', path: path.resolve(source) };
  }

  // GitHub shorthand: github:user/repo[/path]
  if (source.startsWith('github:')) {
    const parts = source.slice(7).split('/');
    if (parts.length < 2) {
      log.error('GitHub 格式无效，正确格式: github:user/repo[/path]');
      process.exit(1);
    }
    return {
      type: 'github',
      user: parts[0],
      repo: parts[1],
      subpath: parts.slice(2).join('/') || '',
      ref: 'main',
    };
  }

  // Full GitHub URL
  if (source.startsWith('https://github.com/')) {
    const url = new URL(source);
    const parts = url.pathname.slice(1).split('/');
    // Check for tree/branch/path pattern
    let ref = 'main';
    let subpath = '';
    if (parts.length >= 4 && parts[2] === 'tree') {
      ref = parts[3];
      subpath = parts.slice(4).join('/');
    } else {
      subpath = parts.slice(2).join('/');
    }
    return {
      type: 'github',
      user: parts[0],
      repo: parts[1],
      subpath,
      ref,
    };
  }

  // Registry name (plain name)
  return { type: 'registry', name: source };
}

/**
 * Install from a local path.
 */
async function installFromLocal(sourcePath, projectDir, flags) {
  if (!fs.existsSync(sourcePath)) {
    log.error(`路径不存在: ${sourcePath}`);
    process.exit(1);
  }

  const pkg = readSkillPackage(sourcePath);
  if (!pkg.hasSkillMd) {
    log.error(`指定路径不是有效的 skill: 缺少 SKILL.md`);
    process.exit(1);
  }

  // Validate unless --skip-validate
  if (!flags['skip-validate']) {
    const errors = validateSkillPackage(sourcePath);
    const critical = errors.filter(e => !e.includes('建议添加'));
    if (critical.length > 0 && !flags.force) {
      log.error('Skill 验证失败:');
      for (const err of errors) {
        log.warn(`  - ${err}`);
      }
      log.info('使用 --force 跳过验证');
      process.exit(1);
    }
  }

  const skillName = pkg.name;
  const targetDir = path.join(projectDir, '.claude', 'skills', skillName);

  // Check if already installed
  const lockfile = readLockfile(projectDir) || createEmptyLockfile();
  if (isInstalled(lockfile, skillName) && !flags.force) {
    log.warn(`Skill ${skillName} 已安装`);
    log.info('使用 --force 强制重新安装');
    process.exit(1);
  }

  // Copy skill files
  ensureDir(targetDir);
  const result = copyDirectory(sourcePath, targetDir, { force: true });

  // Update lockfile
  const contentHash = generateSkillHash(targetDir);
  addSkillEntry(lockfile, skillName, {
    version: pkg.version,
    source: `local:${sourcePath}`,
    contentHash,
    dependencies: pkg.dependencies,
    files: pkg.files,
  });
  writeLockfile(projectDir, lockfile);

  log.success(`Skill ${skillName}@${pkg.version} 安装成功`);
  log.info(`  安装了 ${result.copied} 个文件到 .claude/skills/${skillName}/`);
}

/**
 * Install from GitHub.
 */
async function installFromGithub(resolved, projectDir, flags) {
  // Try to use registry/source modules if available
  try {
    const source = require('../core/source');
    const skillDir = await source.fetchGithubSkill(resolved);
    await installFromLocal(skillDir, projectDir, flags);
    // Cleanup temp directory
    const { removeDirectory } = require('../utils/fs');
    removeDirectory(skillDir);
  } catch (e) {
    log.error(`GitHub 安装失败: ${e.message}`);
    log.info('请确保网络正常且仓库地址正确');
    log.info('格式: github:user/repo[/path]');
    process.exit(1);
  }
}

/**
 * Install from registry.
 */
async function installFromRegistry(skillName, projectDir, flags) {
  try {
    const registry = require('../core/registry');
    const entry = await registry.getSkill(skillName);

    if (!entry) {
      log.error(`在注册表中未找到 skill: ${skillName}`);
      process.exit(1);
    }

    log.info(`从注册表安装: ${entry.name}@${entry.version}`);

    // Resolve the source from registry entry
    const resolved = resolveSource(entry.source);
    await installFromGithub(resolved, projectDir, flags);
  } catch (e) {
    log.error(`注册表安装失败: ${e.message}`);
    process.exit(1);
  }
}

module.exports = { run, resolveSource };
