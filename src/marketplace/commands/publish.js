'use strict';

const fs = require('fs');
const path = require('path');
const log = require('../utils/log');
const { validateSkillPackage, readSkillPackage } = require('../core/skill-package');

/**
 * Publish a skill to the registry.
 */
async function run(args, flags) {
  const skillPath = args[0] || '.';
  const skillDir = path.resolve(skillPath);

  if (!fs.existsSync(skillDir) || !fs.statSync(skillDir).isDirectory()) {
    log.error(`无效的目录: ${skillDir}`);
    process.exit(1);
  }

  log.header('发布 Skill');

  // Step 1: Read and validate
  log.step(1, '验证 skill 包...');
  const errors = validateSkillPackage(skillDir);

  if (errors.length > 0) {
    log.error('验证失败:');
    for (const err of errors) {
      log.warn(`  - ${err}`);
    }
    log.info('请修复以上问题后重试');
    process.exit(1);
  }

  log.success('验证通过');

  // Step 2: Read package info
  log.step(2, '读取 skill 信息...');
  const pkg = readSkillPackage(skillDir);

  log.info(`  名称: ${pkg.name}`);
  log.info(`  版本: ${pkg.version}`);
  log.info(`  描述: ${pkg.description}`);
  log.info(`  作者: ${pkg.author || '未设置'}`);
  log.info(`  关键词: ${(pkg.keywords || []).join(', ') || '无'}`);
  log.info(`  文件数: ${pkg.files.length}`);
  console.log('');

  // Step 3: Generate registry entry
  log.step(3, '生成注册表条目...');
  const entry = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
    keywords: pkg.keywords,
    category: pkg.category,
    dependencies: pkg.dependencies,
    source: `github:<your-username>/<your-repo>/path/to/${pkg.name}`,
    license: pkg.license,
  };

  console.log('');
  log.info('registry.json 条目:');
  console.log(JSON.stringify(entry, null, 2));
  console.log('');

  // Step 4: Print submission instructions
  log.step(4, '提交到注册表');
  console.log('');
  log.info('提交步骤:');
  console.log('');
  log.info('  1. Fork 注册表仓库:');
  log.info('     https://github.com/sdd-workflow/sdd-registry');
  console.log('');
  log.info('  2. 将 skill 文件上传到你的仓库');
  console.log('');
  log.info('  3. 编辑 registry.json，添加上面的条目');
  log.info('     将 source 字段改为实际的 GitHub 路径');
  console.log('');
  log.info('  4. 提交 Pull Request');
  console.log('');
  log.success('发布指引已生成！');
}

module.exports = { run };
