'use strict';

const fs = require('fs');
const path = require('path');
const log = require('../utils/log');
const { ensureDir } = require('../utils/fs');

/**
 * Scaffold a new skill.
 */
async function run(args, flags) {
  const name = args[0];

  if (!name) {
    log.error('请指定 skill 名称');
    log.info('用法: sdd create <skill-name>');
    process.exit(1);
  }

  // Validate name
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    log.error(`无效的 skill 名称: ${name}`);
    log.info('名称只能包含小写字母、数字和连字符，且以字母开头');
    process.exit(1);
  }

  const targetDir = path.resolve(name);

  if (fs.existsSync(targetDir)) {
    log.error(`目录已存在: ${targetDir}`);
    process.exit(1);
  }

  // Create directory structure
  ensureDir(targetDir);

  // Write SKILL.md
  const skillMd = `---
name: ${name}
description: 在此描述你的 skill 功能
invocable: true
---

# ${name}

> 简要描述这个 skill 的用途

## 核心定位

> 这个 skill 在工作流中的角色和定位

## 执行步骤

### 1. 第一步
描述第一步要做什么

### 2. 第二步
描述第二步要做什么

## 注意事项

- 注意事项 1
- 注意事项 2
`;

  fs.writeFileSync(path.join(targetDir, 'SKILL.md'), skillMd);

  // Write manifest.json
  const manifest = {
    name: name,
    version: '0.1.0',
    description: '在此描述你的 skill 功能',
    author: '',
    license: 'MIT',
    keywords: [],
    category: 'custom',
    sddVersion: '>=1.0.0',
    dependencies: {},
    files: ['SKILL.md', 'manifest.json'],
  };

  fs.writeFileSync(
    path.join(targetDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );

  log.success(`Skill 脚手架已创建: ${targetDir}`);
  console.log('');
  log.info('创建的文件:');
  log.info(`  ${path.join(name, 'SKILL.md')}`);
  log.info(`  ${path.join(name, 'manifest.json')}`);
  console.log('');
  log.info('下一步:');
  log.info(`  1. 编辑 ${name}/SKILL.md 编写 skill 指令`);
  log.info(`  2. 编辑 ${name}/manifest.json 填写元数据`);
  log.info(`  3. 运行 sdd validate ./${name} 验证`);
  log.info(`  4. 运行 sdd install ./${name} 安装到项目`);
}

module.exports = { run };
