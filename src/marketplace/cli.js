'use strict';

const path = require('path');
const fs = require('fs');
const log = require('./utils/log');

const COMMANDS = {
  install:   { desc: '安装一个 skill（本地路径、GitHub 或注册表名称）', alias: ['i', 'add'] },
  uninstall: { desc: '卸载一个 skill', alias: ['remove', 'rm'] },
  list:      { desc: '列出已安装的 skills', alias: ['ls'] },
  search:    { desc: '搜索注册表中的 skills', alias: ['s', 'find'] },
  publish:   { desc: '发布当前 skill 到注册表', alias: ['pub'] },
  info:      { desc: '显示 skill 详情', alias: ['show'] },
  update:    { desc: '更新已安装的 skills', alias: ['up', 'upgrade'] },
  validate:  { desc: '验证 skill 包完整性', alias: ['check'] },
  create:    { desc: '脚手架创建新 skill', alias: ['new', 'init'] },
};

function resolveCommand(name) {
  if (COMMANDS[name]) return name;
  for (const [cmd, cfg] of Object.entries(COMMANDS)) {
    if (cfg.alias && cfg.alias.includes(name)) return cmd;
  }
  return null;
}

function showHelp() {
  const pkg = readPkg();

  console.log(`
SDD Skill Marketplace v${pkg.version}

用法:
  sdd <command> [arguments] [options]

命令:
${Object.entries(COMMANDS).map(([name, cfg]) =>
    `  ${name.padEnd(12)}${cfg.desc}`
  ).join('\n')}

全局选项:
  --help, -h      显示帮助信息
  --version, -v   显示版本号
  --verbose       详细输出模式

示例:
  sdd install ./my-skill                    从本地路径安装
  sdd install github:user/repo/skill-name   从 GitHub 安装
  sdd install sdd-specify                   从注册表安装
  sdd list                                  查看已安装的 skills
  sdd search test                           搜索注册表
  sdd create my-custom-skill                创建新 skill
  sdd publish                               发布 skill 到注册表

更多信息: https://github.com/sdd-workflow/sdd-workflow
`);
}

function readPkg() {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8')
    );
  } catch (e) {
    return { version: 'unknown' };
  }
}

async function run(argv) {
  const args = [];
  const flags = {};

  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const [key, val] = arg.slice(2).split('=');
      flags[key] = val !== undefined ? val : true;
    } else if (arg.startsWith('-') && arg.length === 2) {
      if (arg === '-h') flags.help = true;
      else if (arg === '-v') flags.version = true;
      else flags[arg.slice(1)] = true;
    } else {
      args.push(arg);
    }
  }

  if (flags.help) {
    showHelp();
    process.exit(0);
  }

  if (flags.version) {
    const pkg = readPkg();
    console.log(`sdd v${pkg.version}`);
    process.exit(0);
  }

  const cmdName = args[0];
  if (!cmdName) {
    showHelp();
    process.exit(0);
  }

  const resolvedCmd = resolveCommand(cmdName);
  if (!resolvedCmd) {
    log.error(`未知命令: ${cmdName}`);
    console.log(`运行 sdd --help 查看可用命令`);
    process.exit(1);
  }

  const cmdArgs = args.slice(1);

  try {
    const cmdModule = require(`./commands/${resolvedCmd}`);
    await cmdModule.run(cmdArgs, flags);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      log.error(`命令模块未找到: ${resolvedCmd}`);
      process.exit(1);
    }
    log.error(err.message);
    if (flags.verbose && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

module.exports = { run, COMMANDS };
