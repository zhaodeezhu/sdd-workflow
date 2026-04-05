'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const log = require('../utils/log');
const { ensureDir, removeDirectory, copyDirectory } = require('../utils/fs');
const { getJson } = require('../utils/http');
const { isGitAvailable, shallowClone, getDefaultBranch } = require('../utils/git');

/**
 * Fetch a skill from GitHub and return the local path to the skill directory.
 * The caller is responsible for cleaning up the temp directory.
 */
async function fetchGithubSkill(resolved) {
  const { user, repo, subpath, ref } = resolved;

  if (!isGitAvailable()) {
    throw new Error('需要 git 命令来从 GitHub 安装。请确保 git 已安装并可用。');
  }

  const repoUrl = `https://github.com/${user}/${repo}.git`;
  const tempDir = path.join(os.tmpdir(), `sdd-skill-${Date.now()}`);

  log.info(`正在从 GitHub 下载: ${user}/${repo}${subpath ? '/' + subpath : ''}`);

  // Determine branch
  let branch = ref || 'main';
  try {
    branch = await getDefaultBranch(repoUrl);
  } catch (e) {
    // Use provided ref or default to main
  }

  // Shallow clone
  try {
    shallowClone(repoUrl, tempDir, { branch });
  } catch (e) {
    throw new Error(`无法克隆仓库: ${user}/${repo}。请确认仓库地址正确且可访问。`);
  }

  // If subpath specified, check it exists
  if (subpath) {
    const skillDir = path.join(tempDir, subpath);
    if (!fs.existsSync(skillDir)) {
      removeDirectory(tempDir);
      throw new Error(`仓库中未找到路径: ${subpath}`);
    }

    if (!fs.existsSync(path.join(skillDir, 'SKILL.md'))) {
      removeDirectory(tempDir);
      throw new Error(`指定路径不是有效的 skill: 缺少 SKILL.md`);
    }

    return skillDir;
  }

  // No subpath - check if root is a skill
  if (fs.existsSync(path.join(tempDir, 'SKILL.md'))) {
    return tempDir;
  }

  // Try to find skills in the repo
  const entries = fs.readdirSync(tempDir, { withFileTypes: true });
  const skillDirs = entries.filter(e =>
    e.isDirectory() && fs.existsSync(path.join(tempDir, e.name, 'SKILL.md'))
  );

  if (skillDirs.length === 0) {
    removeDirectory(tempDir);
    throw new Error('仓库中未找到任何 skill（没有包含 SKILL.md 的目录）');
  }

  if (skillDirs.length === 1) {
    return path.join(tempDir, skillDirs[0].name);
  }

  // Multiple skills found - list them
  log.warn(`仓库中有 ${skillDirs.length} 个 skills:`);
  for (const d of skillDirs) {
    log.info(`  - ${d.name}`);
  }
  throw new Error(`请指定要安装的 skill 路径，例如: github:${user}/${repo}/${skillDirs[0].name}`);
}

/**
 * Fetch a skill from GitHub using raw content API (no git clone needed).
 * This is a fallback that works without git installed.
 */
async function fetchGithubSkillRaw(resolved) {
  const { user, repo, subpath, ref } = resolved;
  const branch = ref || 'main';
  const basePath = subpath ? `${subpath}` : '';

  // Try to fetch SKILL.md directly
  const skillMdUrl = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${basePath ? basePath + '/' : ''}SKILL.md`;

  try {
    const { getText } = require('../utils/http');
    await getText(skillMdUrl);
  } catch (e) {
    throw new Error(`无法访问: ${user}/${repo}/${basePath}。请确认路径正确。`);
  }

  // If we can reach it, use git clone approach for full download
  return fetchGithubSkill(resolved);
}

module.exports = { fetchGithubSkill, fetchGithubSkillRaw };
