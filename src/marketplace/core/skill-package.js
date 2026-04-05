'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('../utils/yaml-frontmatter');

const MANIFEST_REQUIRED_FIELDS = ['name', 'version', 'description', 'author'];

/**
 * Read and validate a skill package from a directory.
 * Returns a unified SkillPackage object merging manifest.json + SKILL.md frontmatter.
 * Gracefully degrades if manifest.json is missing.
 */
function readSkillPackage(skillDir) {
  const result = {
    dir: skillDir,
    name: path.basename(skillDir),
    version: '0.0.0',
    description: '',
    author: '',
    license: 'MIT',
    keywords: [],
    category: 'custom',
    sddVersion: '',
    dependencies: {},
    files: [],
    repository: '',
    homepage: '',
    invocable: false,
    hasManifest: false,
    hasSkillMd: false,
    errors: [],
  };

  // Read SKILL.md
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  if (fs.existsSync(skillMdPath)) {
    result.hasSkillMd = true;
    try {
      const content = fs.readFileSync(skillMdPath, 'utf8');
      const { data, body } = parseFrontmatter(content);
      if (data.name) result.name = data.name;
      if (data.description) result.description = data.description;
      if (data.invocable !== undefined) result.invocable = data.invocable;
      result.body = body;
    } catch (e) {
      result.errors.push(`SKILL.md 解析失败: ${e.message}`);
    }
  } else {
    result.errors.push('SKILL.md 文件不存在');
  }

  // Read manifest.json (optional, graceful degradation)
  const manifestPath = path.join(skillDir, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    result.hasManifest = true;
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      // Manifest values take precedence over SKILL.md frontmatter for metadata
      if (manifest.name) result.name = manifest.name;
      if (manifest.version) result.version = manifest.version;
      if (manifest.description) result.description = manifest.description;
      if (manifest.author) result.author = manifest.author;
      if (manifest.license) result.license = manifest.license;
      if (manifest.keywords) result.keywords = manifest.keywords;
      if (manifest.category) result.category = manifest.category;
      if (manifest.sddVersion) result.sddVersion = manifest.sddVersion;
      if (manifest.dependencies) result.dependencies = manifest.dependencies;
      if (manifest.files) result.files = manifest.files;
      if (manifest.repository) result.repository = manifest.repository;
      if (manifest.homepage) result.homepage = manifest.homepage;
    } catch (e) {
      result.errors.push(`manifest.json 解析失败: ${e.message}`);
    }
  }

  // Collect files list if not specified in manifest
  if (result.files.length === 0) {
    result.files = collectSkillFiles(skillDir);
  }

  return result;
}

/**
 * Validate a skill package. Returns an array of error strings.
 */
function validateSkillPackage(skillDir) {
  const errors = [];

  // Check SKILL.md exists
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    errors.push('SKILL.md 文件不存在（必须）');
    return errors; // Can't continue without SKILL.md
  }

  // Parse SKILL.md frontmatter
  try {
    const content = fs.readFileSync(skillMdPath, 'utf8');
    const { data, body } = parseFrontmatter(content);
    if (!data.name) errors.push('SKILL.md frontmatter 缺少 name 字段');
    if (!data.description) errors.push('SKILL.md frontmatter 缺少 description 字段');
    if (!body || body.trim().length === 0) errors.push('SKILL.md 内容为空');
  } catch (e) {
    errors.push(`SKILL.md 解析失败: ${e.message}`);
  }

  // Check manifest.json
  const manifestPath = path.join(skillDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    errors.push('manifest.json 文件不存在（建议添加）');
  } else {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      for (const field of MANIFEST_REQUIRED_FIELDS) {
        if (!manifest[field]) {
          errors.push(`manifest.json 缺少必填字段: ${field}`);
        }
      }
      // Validate version format
      if (manifest.version && !isValidSemver(manifest.version)) {
        errors.push(`manifest.json version 格式无效: ${manifest.version}（需要 semver 格式，如 1.0.0）`);
      }
      // Validate name matches directory
      if (manifest.name && manifest.name !== path.basename(skillDir)) {
        errors.push(`manifest.json name (${manifest.name}) 与目录名 (${path.basename(skillDir)}) 不匹配`);
      }
    } catch (e) {
      errors.push(`manifest.json 解析失败: ${e.message}`);
    }
  }

  return errors;
}

/**
 * Simple semver format check.
 */
function isValidSemver(version) {
  return /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/.test(version);
}

/**
 * Collect files in a skill directory.
 */
function collectSkillFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subFiles = collectSkillFilesRecursive(path.join(dir, entry.name), entry.name);
      files.push(...subFiles);
    } else {
      files.push(entry.name);
    }
  }
  return files;
}

function collectSkillFilesRecursive(dir, prefix) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      files.push(...collectSkillFilesRecursive(path.join(dir, entry.name), relPath));
    } else {
      files.push(relPath);
    }
  }
  return files;
}

module.exports = { readSkillPackage, validateSkillPackage, isValidSemver };
