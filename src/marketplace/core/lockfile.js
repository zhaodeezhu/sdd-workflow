'use strict';

const path = require('path');
const { readJsonFile, writeJsonFile, ensureDir, hashDirectory } = require('../utils/fs');

const LOCKFILE_NAME = 'skill-lock.json';

/**
 * Get the lockfile path for a project directory.
 */
function getLockfilePath(projectDir) {
  return path.join(projectDir, '.specify', LOCKFILE_NAME);
}

/**
 * Read the lockfile. Returns the lockfile object or null if not found.
 */
function readLockfile(projectDir) {
  return readJsonFile(getLockfilePath(projectDir));
}

/**
 * Write the lockfile.
 */
function writeLockfile(projectDir, lockfile) {
  lockfile.version = lockfile.version || 1;
  lockfile.updatedAt = new Date().toISOString();
  writeJsonFile(getLockfilePath(projectDir), lockfile);
}

/**
 * Create an empty lockfile.
 */
function createEmptyLockfile() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    skills: {},
  };
}

/**
 * Add or update a skill entry in the lockfile.
 */
function addSkillEntry(lockfile, skillName, entry) {
  lockfile.skills[skillName] = {
    version: entry.version || '0.0.0',
    source: entry.source || 'local',
    sourceUrl: entry.sourceUrl || '',
    installedAt: new Date().toISOString(),
    contentHash: entry.contentHash || '',
    dependencies: entry.dependencies || {},
    files: entry.files || [],
  };
  return lockfile;
}

/**
 * Remove a skill entry from the lockfile.
 */
function removeSkillEntry(lockfile, skillName) {
  delete lockfile.skills[skillName];
  return lockfile;
}

/**
 * Get a skill entry from the lockfile.
 */
function getSkillEntry(lockfile, skillName) {
  return lockfile && lockfile.skills ? lockfile.skills[skillName] : null;
}

/**
 * Check if a skill is installed (exists in lockfile).
 */
function isInstalled(lockfile, skillName) {
  return !!getSkillEntry(lockfile, skillName);
}

/**
 * Find all skills that depend on the given skill (reverse dependencies).
 */
function getReverseDependencies(lockfile, skillName) {
  const dependents = [];
  for (const [name, entry] of Object.entries(lockfile.skills || {})) {
    if (entry.dependencies && entry.dependencies[skillName]) {
      dependents.push(name);
    }
  }
  return dependents;
}

/**
 * Generate a content hash for an installed skill directory.
 */
function generateSkillHash(skillDir) {
  try {
    return hashDirectory(skillDir);
  } catch (e) {
    return '';
  }
}

module.exports = {
  getLockfilePath,
  readLockfile,
  writeLockfile,
  createEmptyLockfile,
  addSkillEntry,
  removeSkillEntry,
  getSkillEntry,
  isInstalled,
  getReverseDependencies,
  generateSkillHash,
};
