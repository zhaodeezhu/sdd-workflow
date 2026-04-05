'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Recursively collect all files in a directory, returning relative paths.
 */
function collectFiles(dir, baseDir) {
  baseDir = baseDir || dir;
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const subFile of collectFiles(fullPath, baseDir)) {
        files.push(path.join(entry.name, subFile));
      }
    } else {
      files.push(entry.name);
    }
  }
  return files;
}

/**
 * Hash file/directory content for integrity checking.
 */
function hashContent(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Hash all files in a directory, return a combined hash.
 */
function hashDirectory(dir) {
  const files = collectFiles(dir).sort();
  const hash = crypto.createHash('md5');
  for (const relPath of files) {
    const fullPath = path.join(dir, relPath);
    const content = fs.readFileSync(fullPath);
    hash.update(relPath);
    hash.update(content);
  }
  return hash.digest('hex');
}

/**
 * Recursively copy a directory.
 */
function copyDirectory(source, target, options = {}) {
  const result = { copied: 0, skipped: 0, dirs: 0 };

  if (!fs.existsSync(source)) return result;

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
        result.dirs++;
      }
      const subResult = copyDirectory(sourcePath, targetPath, options);
      result.copied += subResult.copied;
      result.skipped += subResult.skipped;
      result.dirs += subResult.dirs;
    } else {
      if (fs.existsSync(targetPath) && !options.force) {
        result.skipped++;
        continue;
      }

      const parentDir = path.dirname(targetPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
        result.dirs++;
      }
      fs.copyFileSync(sourcePath, targetPath);
      result.copied++;
    }
  }

  return result;
}

/**
 * Remove a directory recursively.
 */
function removeDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

/**
 * Ensure a directory exists.
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Read JSON file, return null on error.
 */
function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

/**
 * Write JSON file with formatting.
 */
function writeJsonFile(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

module.exports = {
  collectFiles,
  hashContent,
  hashDirectory,
  copyDirectory,
  removeDirectory,
  ensureDir,
  readJsonFile,
  writeJsonFile,
};
