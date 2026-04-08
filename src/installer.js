#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const MANIFEST_FILE = '.sdd-manifest.json';

/**
 * Install SDD workflow to target project directory.
 * @param {string} targetDir - Absolute path to target project
 * @param {object} options - Installation options
 * @param {boolean} options.force - Overwrite existing files
 * @param {boolean} options.dryRun - Preview only, don't write files
 * @param {boolean} options.update - Incremental update: only update changed files, skip user-customized files
 */
async function install(targetDir, options = {}) {
  const { force = false, dryRun = false, update = false } = options;

  if (update) {
    return updateInstall(targetDir, options);
  }

  console.log('');
  console.log('━━━ SDD Workflow Installer ━━━');
  console.log('');

  // 1. Validate target directory
  if (!fs.existsSync(path.join(targetDir, '.git'))) {
    console.log('⚠️  Warning: Target directory is not a git repository.');
    console.log('   SDD workflow works best in a git-managed project.');
    console.log('');
  }

  // 2. Define installation targets
  const operations = [
    // Skills → .claude/skills/sdd-*
    {
      description: 'SDD Skills',
      source: path.join(TEMPLATES_DIR, 'skills'),
      target: path.join(targetDir, '.claude', 'skills'),
      type: 'skills',
    },
    // .specify/ directory structure
    {
      description: 'SDD Templates & Scripts',
      source: path.join(TEMPLATES_DIR, 'specify'),
      target: path.join(targetDir, '.specify'),
      type: 'specify',
    },
    // Agent prompt templates for v4 Agent-Per-Phase architecture
    {
      description: 'Agent Prompt Templates',
      source: path.join(TEMPLATES_DIR, 'specify', 'agent-prompts'),
      target: path.join(targetDir, '.specify', 'templates', 'agent-prompts'),
      type: 'agent-prompts',
    },
    // Team configuration
    {
      description: 'Team Configuration',
      source: path.join(TEMPLATES_DIR, 'teams'),
      target: path.join(targetDir, '.claude', 'teams'),
      type: 'teams',
    },
  ];

  // 3. Execute installations
  let totalFiles = 0;
  let skippedFiles = 0;
  let createdDirs = 0;
  const installedFiles = []; // track for manifest

  for (const op of operations) {
    if (!fs.existsSync(op.source)) {
      console.log(`⚠️  Source not found: ${op.description} — skipping`);
      continue;
    }

    console.log(`📦 Installing ${op.description}...`);

    const result = copyDirectory(op.source, op.target, {
      force,
      dryRun,
      installedFiles,
      sourceBase: op.source,
      targetBase: op.target,
      trackSkipped: true, // also track skipped files for manifest
    });

    totalFiles += result.copied;
    skippedFiles += result.skipped;
    createdDirs += result.dirs;
  }

  // 4. Create empty specs directory if not exists
  const specsDir = path.join(targetDir, '.specify', 'specs');
  if (!fs.existsSync(specsDir) && !dryRun) {
    fs.mkdirSync(specsDir, { recursive: true });
  }

  // 5. Create empty memory directory if not exists
  const memoryDir = path.join(targetDir, '.specify', 'memory');
  if (!fs.existsSync(memoryDir) && !dryRun) {
    fs.mkdirSync(path.join(targetDir, '.specify', 'memory'), { recursive: true });
  }

  // 6. Save manifest (tracks installed file hashes for future updates)
  if (!dryRun) {
    saveManifest(targetDir, installedFiles);
    // Also generate skill-lock.json for marketplace compatibility
    generateSkillLock(targetDir);
  }

  // 7. Output results
  console.log('');
  console.log('━━━ Installation Complete ━━━');
  console.log('');
  console.log(`  Files installed: ${totalFiles}`);
  console.log(`  Files skipped:   ${skippedFiles}`);
  console.log(`  Directories:     ${createdDirs}`);
  console.log('');

  if (dryRun) {
    console.log('🔍 This was a dry run. No files were actually created.');
    console.log('   Run without --dry-run to install.');
    return;
  }

  // 8. Print next steps
  console.log('📋 Next Steps:');
  console.log('');
  console.log('  1. Open Claude Code in this project');
  console.log('  2. Run /sdd-init to generate project constitution');
  console.log('     (This analyzes your project and creates a tailored config)');
  console.log('');
  console.log('  3. Start using SDD workflow:');
  console.log('     /sdd-specify <feature-name>    — Create specification');
  console.log('     /sdd-testcases                 — Design test cases');
  console.log('     /sdd-plan                      — Plan implementation');
  console.log('     /sdd-tasks                     — Break down tasks');
  console.log('     /sdd-implement                 — Execute development');
  console.log('     /sdd-review                    — Quality review');
  console.log('     /sdd-run <id> <description>    — Full auto pipeline (recommended)');
  console.log('');
  console.log('  🔔 Configure task completion notifications (Feishu):');
  console.log('     /sdd-notify configure');
  console.log('');
  console.log('  💡 To update Sdd workflow in the future:');
  console.log('     npx sdd-workflow --update');
  console.log('');
  console.log('  🔔 Configure task completion notifications (Feishu):');
  console.log('     /sdd-notify configure');
  console.log('');
  console.log('  🔔 Configure task completion notifications (WeChat Work/Feishu):');
  console.log('     /sdd-notify configure');
  console.log('');

  // 9. Suggest CLAUDE.md additions
  printClaudeMdSuggestions(targetDir);
}

/**
 * Incremental update: only update files that changed in source,
 * skip files that user has customized.
 */
async function updateInstall(targetDir, options = {}) {
  const { dryRun = false } = options;

  console.log('');
  console.log('━━━ SDD Workflow Updater ━━━');
  console.log('');

  // 1. Load existing manifest
  const manifestPath = path.join(targetDir, '.specify', MANIFEST_FILE);
  const manifest = loadManifest(targetDir);

  if (!manifest) {
    console.log('⚠️  No manifest found. This project was installed before manifest tracking was added.');
    console.log('');
    console.log('   To enable smart updates, run a regular install first to create the manifest:');
    console.log('     npx sdd-workflow              # Creates manifest without overwriting existing files');
    console.log('');
    console.log('   Then --update will correctly distinguish source updates from your customizations.');
    console.log('');
    console.log('   Falling back to conservative mode: all changed files treated as user-customized.');
    console.log('   Use --force to overwrite everything.');
    console.log('');
  }

  // 2. Collect all source files
  const operations = [
    {
      description: 'SDD Skills',
      source: path.join(TEMPLATES_DIR, 'skills'),
      target: path.join(targetDir, '.claude', 'skills'),
    },
    {
      description: 'SDD Templates & Scripts',
      source: path.join(TEMPLATES_DIR, 'specify'),
      target: path.join(targetDir, '.specify'),
    },
    {
      description: 'Agent Prompt Templates',
      source: path.join(TEMPLATES_DIR, 'specify', 'agent-prompts'),
      target: path.join(targetDir, '.specify', 'templates', 'agent-prompts'),
    },
    {
      description: 'Team Configuration',
      source: path.join(TEMPLATES_DIR, 'teams'),
      target: path.join(targetDir, '.claude', 'teams'),
    },
  ];

  const stats = {
    updated: [],    // source changed, target was original → auto-update
    newFiles: [],   // not in target → auto-add
    customized: [], // user modified → skip with warning
    unchanged: [],  // source == target → skip
    removed: [],    // in manifest but not in source → report
  };

  // 3. Compare source vs target using manifest
  for (const op of operations) {
    if (!fs.existsSync(op.source)) continue;

    const sourceFiles = collectFiles(op.source);
    for (const relPath of sourceFiles) {
      const sourcePath = path.join(op.source, relPath);
      const targetPath = path.join(op.target, relPath);
      const sourceContent = fs.readFileSync(sourcePath);
      const sourceHash = hashContent(sourceContent);

      if (!fs.existsSync(targetPath)) {
        // New file
        stats.newFiles.push({ relPath: `${op.type || ''}/${relPath}`, sourcePath, targetPath, sourceContent });
        continue;
      }

      const targetContent = fs.readFileSync(targetPath);
      const targetHash = hashContent(targetContent);

      if (sourceHash === targetHash) {
        // Already up to date
        stats.unchanged.push(relPath);
        continue;
      }

      // Content differs - check if user customized
      // Manifest records source hash from last install/update
      const manifestEntry = manifest ? manifest.files[relPath] : null;

      if (manifestEntry) {
        if (targetHash === manifestEntry.hash) {
          // Target matches original source → user hasn't modified → safe to update
          stats.updated.push({ relPath, sourcePath, targetPath, sourceContent });
        } else {
          // Target differs from original source → user customized → skip
          stats.customized.push({ relPath, sourcePath, targetPath, sourceContent });
        }
      } else {
        // No manifest entry - conservative: treat all as customized
        // User should run regular install first to create manifest
        stats.customized.push({ relPath, sourcePath, targetPath, sourceContent });
      }
    }
  }

  // 4. Check for removed files (in manifest but not in source)
  if (manifest) {
    const sourceFilesSet = new Set();
    for (const op of operations) {
      if (!fs.existsSync(op.source)) continue;
      for (const relPath of collectFiles(op.source)) {
        sourceFilesSet.add(relPath);
      }
    }
    for (const relPath of Object.keys(manifest.files)) {
      if (!sourceFilesSet.has(relPath)) {
        stats.removed.push(relPath);
      }
    }
  }

  // 5. Print update summary
  console.log('📊 Update Analysis:');
  console.log('');
  console.log(`   ✅ Up to date:    ${stats.unchanged.length} file(s)`);
  console.log(`   📥 Source updated: ${stats.updated.length} file(s) will be updated`);
  console.log(`   🆕 New files:      ${stats.newFiles.length} file(s) will be added`);
  console.log(`   ✏️  Customized:    ${stats.customized.length} file(s) skipped (user modified)`);
  if (stats.removed.length > 0) {
    console.log(`   🗑️  Removed in source: ${stats.removed.length} file(s) (not deleted, manual cleanup needed)`);
  }
  console.log('');

  if (stats.updated.length === 0 && stats.newFiles.length === 0) {
    console.log('✅ Everything is up to date. No changes needed.');
    return;
  }

  // 6. Show details of changes
  if (stats.updated.length > 0) {
    console.log('📥 Files to update:');
    for (const f of stats.updated) {
      console.log(`   - ${f.relPath}`);
    }
    console.log('');
  }

  if (stats.newFiles.length > 0) {
    console.log('🆕 New files to add:');
    for (const f of stats.newFiles) {
      console.log(`   - ${f.relPath}`);
    }
    console.log('');
  }

  if (stats.customized.length > 0) {
    console.log('⏭️  Customized files (skipped, use --force to overwrite):');
    for (const f of stats.customized) {
      console.log(`   - ${f.relPath}`);
    }
    console.log('');
  }

  if (dryRun) {
    console.log('🔍 This was a dry run. No files were actually updated.');
    console.log('   Run without --dry-run to apply updates.');
    return;
  }

  // 7. Apply updates
  let appliedCount = 0;

  for (const f of stats.updated) {
    const parentDir = path.dirname(f.targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(f.targetPath, f.sourceContent);
    appliedCount++;
  }

  for (const f of stats.newFiles) {
    const parentDir = path.dirname(f.targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(f.targetPath, f.sourceContent);
    appliedCount++;
  }

  // 8. Update manifest
  const allInstalledFiles = [];
  // Re-scan all installed files to rebuild manifest
  for (const op of operations) {
    if (!fs.existsSync(op.source)) continue;
    for (const relPath of collectFiles(op.source)) {
      const targetPath = path.join(op.target, relPath);
      if (fs.existsSync(targetPath)) {
        allInstalledFiles.push({
          relPath,
          targetPath,
        });
      }
    }
  }
  saveManifest(targetDir, allInstalledFiles);

  console.log(`✅ ${appliedCount} file(s) updated successfully.`);
  console.log('');

  if (stats.customized.length > 0) {
    console.log('💡 To overwrite customized files, run:');
    console.log('   npx sdd-workflow --force');
    console.log('');
  }
}

// ─── Manifest Management ───

/**
 * Save installation manifest for future update tracking.
 */
function saveManifest(targetDir, installedFiles) {
  const manifest = {
    version: getVersion(),
    installedAt: new Date().toISOString(),
    files: {},
  };

  for (const item of installedFiles) {
    // Record SOURCE hash (not target hash) so we can detect user customizations later
    // If source file exists, hash it; otherwise hash the target (e.g. for skipped files without source)
    let hash;
    if (item.sourcePath && fs.existsSync(item.sourcePath)) {
      hash = hashContent(fs.readFileSync(item.sourcePath));
    } else if (fs.existsSync(item.targetPath)) {
      hash = hashContent(fs.readFileSync(item.targetPath));
    }
    if (hash) {
      manifest.files[item.relPath] = {
        hash: hash,
        installedAt: new Date().toISOString(),
      };
    }
  }

  const manifestDir = path.join(targetDir, '.specify');
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(manifestDir, MANIFEST_FILE),
    JSON.stringify(manifest, null, 2)
  );
}

/**
 * Load existing manifest.
 */
function loadManifest(targetDir) {
  const manifestPath = path.join(targetDir, '.specify', MANIFEST_FILE);
  if (!fs.existsSync(manifestPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

/**
 * Get package version.
 */
function getVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
    );
    return pkg.version;
  } catch (e) {
    return 'unknown';
  }
}

// ─── File Utilities ───

/**
 * Hash file content for comparison.
 */
function hashContent(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Collect all files in a directory, returning relative paths.
 */
function collectFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const subFile of collectFiles(fullPath)) {
        files.push(path.join(entry.name, subFile));
      }
    } else {
      files.push(entry.name);
    }
  }
  return files;
}

/**
 * Recursively copy a directory.
 */
function copyDirectory(source, target, options) {
  const result = { copied: 0, skipped: 0, dirs: 0 };

  if (!fs.existsSync(source)) return result;

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      if (!options.dryRun && !fs.existsSync(targetPath)) {
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
        // Also track skipped files for manifest (to build baseline for --update)
        if (options.installedFiles && options.sourceBase && options.trackSkipped) {
          const relPath = path.relative(options.sourceBase, sourcePath);
          options.installedFiles.push({ relPath, sourcePath, targetPath });
        }
        continue;
      }

      if (!options.dryRun) {
        const parentDir = path.dirname(targetPath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
          result.dirs++;
        }
        fs.copyFileSync(sourcePath, targetPath);
      }
      result.copied++;

      // Track for manifest
      if (options.installedFiles && options.sourceBase) {
        const relPath = path.relative(options.sourceBase, sourcePath);
        options.installedFiles.push({ relPath, sourcePath, targetPath });
      }
    }
  }

  return result;
}

/**
 * Print suggestions for CLAUDE.md additions.
 */
function printClaudeMdSuggestions(targetDir) {
  const claudeMdPath = path.join(targetDir, 'CLAUDE.md');
  const hasClaudeMd = fs.existsSync(claudeMdPath);

  console.log('━━━ CLAUDE.md Suggestions ━━━');
  console.log('');

  if (hasClaudeMd) {
    console.log('  Add the following to your existing CLAUDE.md:');
  } else {
    console.log('  Create a CLAUDE.md with the following content:');
  }

  console.log('');
  console.log('  ```markdown');
  console.log('  ## SDD Workflow');
  console.log('');
  console.log('  This project uses SDD (Specification-Driven Development).');
  console.log('');
  console.log('  ### Quick Start');
  console.log('  1. `/sdd-init` — Initialize SDD for this project (first time only)');
  console.log('  2. `/sdd-run <id> <description>` — Full auto pipeline (recommended)');
  console.log('  3. Or use individual commands: /sdd-specify → /sdd-testcases → /sdd-plan → /sdd-tasks → /sdd-implement → /sdd-review');
  console.log('');
  console.log('  ### Document Structure');
  console.log('  - `.specify/memory/constitution.md` — Project constitution (tech stack, principles)');
  console.log('  - `.specify/specs/<id>-<name>/` — Feature specifications');
  console.log('  - `.specify/templates/` — Document templates');
  console.log('  ```');
  console.log('');

  // Check if .gitignore needs updating
  const gitignorePath = path.join(targetDir, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignore.includes('.specify/specs/')) {
      console.log('  💡 Consider adding to .gitignore:');
      console.log('     .specify/specs/           # SDD feature specs (project-specific)');
      console.log('     .specify/memory/          # SDD project memory');
      console.log('     .specify/notification.json # SDD notification config (contains webhook URL)');
      console.log('');
    }
  }
}

// ─── Skill Lock Generation ───

/**
 * Generate skill-lock.json for marketplace compatibility.
 * This is called after installation to ensure sdd list/update commands work
 * with projects installed via the traditional npx sdd-workflow method.
 */
function generateSkillLock(targetDir) {
  const skillsDir = path.join(targetDir, '.claude', 'skills');
  if (!fs.existsSync(skillsDir)) return;

  const lockPath = path.join(targetDir, '.specify', 'skill-lock.json');

  // Read existing lockfile if present (preserve manually installed skills)
  let lockfile = null;
  if (fs.existsSync(lockPath)) {
    try {
      lockfile = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    } catch (e) {
      // ignore
    }
  }

  if (!lockfile) {
    lockfile = { version: 1, updatedAt: new Date().toISOString(), skills: {} };
  }

  // Scan installed skill directories
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillDir = path.join(skillsDir, entry.name);
    const skillMdPath = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;

    // Skip if already tracked (preserve existing entry)
    if (lockfile.skills[entry.name]) continue;

    // Read version from manifest.json if available
    let version = '1.1.0';
    let description = '';
    let dependencies = {};
    const manifestPath = path.join(skillDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (manifest.version) version = manifest.version;
        if (manifest.description) description = manifest.description;
        if (manifest.dependencies) dependencies = manifest.dependencies;
      } catch (e) {
        // ignore
      }
    }

    // Collect files
    const files = [];
    collectFilesRelative(skillDir, '', files);

    // Generate content hash
    const hash = crypto.createHash('md5');
    for (const relPath of files) {
      const fullPath = path.join(skillDir, relPath);
      hash.update(relPath);
      hash.update(fs.readFileSync(fullPath));
    }

    lockfile.skills[entry.name] = {
      version,
      source: 'builtin',
      sourceUrl: '',
      installedAt: new Date().toISOString(),
      contentHash: hash.digest('hex'),
      dependencies,
      files,
    };
  }

  lockfile.updatedAt = new Date().toISOString();

  const lockDir = path.join(targetDir, '.specify');
  if (!fs.existsSync(lockDir)) {
    fs.mkdirSync(lockDir, { recursive: true });
  }
  fs.writeFileSync(lockPath, JSON.stringify(lockfile, null, 2) + '\n');
}

/**
 * Collect files relative to a directory.
 */
function collectFilesRelative(dir, prefix, result) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      collectFilesRelative(path.join(dir, entry.name), relPath, result);
    } else {
      result.push(relPath);
    }
  }
}

module.exports = { install };
