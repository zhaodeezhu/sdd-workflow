'use strict';

const fs = require('fs');
const path = require('path');
const log = require('../utils/log');
const { validateSkillPackage, readSkillPackage } = require('../core/skill-package');

/**
 * Validate a skill package.
 */
async function run(args, flags) {
  const skillPath = args[0] || '.';
  const skillDir = path.resolve(skillPath);

  if (!fs.existsSync(skillDir)) {
    log.error(`路径不存在: ${skillDir}`);
    process.exit(1);
  }

  if (!fs.statSync(skillDir).isDirectory()) {
    log.error(`路径不是目录: ${skillDir}`);
    process.exit(1);
  }

  log.header(`验证 Skill: ${path.basename(skillDir)}`);

  const errors = validateSkillPackage(skillDir);
  const pkg = readSkillPackage(skillDir);

  // Print package info
  log.info(`  名称: ${pkg.name}`);
  log.info(`  版本: ${pkg.version}`);
  log.info(`  描述: ${pkg.description || '无'}`);
  log.info(`  作者: ${pkg.author || '未设置'}`);
  log.info(`  文件数: ${pkg.files.length}`);
  console.log('');

  if (errors.length === 0) {
    log.success('验证通过！skill 包格式正确');
  } else {
    log.error(`发现 ${errors.length} 个问题:`);
    console.log('');
    for (const err of errors) {
      log.warn(`  - ${err}`);
    }
    process.exit(1);
  }
}

module.exports = { run };
