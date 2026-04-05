'use strict';

const { execSync } = require('child_process');

/**
 * Run a git command and return stdout.
 */
function git(args, options = {}) {
  const cmd = `git ${args}`;
  try {
    return execSync(cmd, {
      encoding: 'utf8',
      timeout: options.timeout || 30000,
      cwd: options.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (e) {
    throw new Error(`git 命令失败: ${cmd}\n${e.stderr || e.message}`);
  }
}

/**
 * Check if git is available.
 */
function isGitAvailable() {
  try {
    execSync('git --version', { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Clone a repo (shallow) to a target directory.
 */
function shallowClone(repoUrl, targetDir, options = {}) {
  const branch = options.branch || 'main';
  const depth = options.depth || 1;

  return git(`clone --depth ${depth} --branch ${branch} --single-branch ${repoUrl} ${targetDir}`);
}

/**
 * Extract a subdirectory from a git repo using archive.
 */
function archiveSubdir(repoDir, subpath, outputFile) {
  // Use git archive to extract specific path
  return git(`archive --format=tar HEAD:${subpath}`, { cwd: repoDir });
}

/**
 * Get the default branch of a remote repo.
 */
function getDefaultBranch(repoUrl) {
  try {
    const output = git(`ls-remote --symref ${repoUrl} HEAD`);
    const match = output.match(/ref:\s*refs\/heads\/(\S+)/);
    return match ? match[1] : 'main';
  } catch (e) {
    return 'main';
  }
}

/**
 * Check if a repo exists (is accessible).
 */
function repoExists(repoUrl) {
  try {
    git(`ls-remote --heads ${repoUrl}`);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = { git, isGitAvailable, shallowClone, archiveSubdir, getDefaultBranch, repoExists };
