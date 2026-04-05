'use strict';

const log = require('../utils/log');
const { search: searchRegistry } = require('../core/registry');

/**
 * Search the registry for skills.
 */
async function run(args, flags) {
  const keyword = args[0];

  if (!keyword) {
    log.error('请指定搜索关键词');
    log.info('用法: sdd search <keyword>');
    process.exit(1);
  }

  log.info(`正在搜索: "${keyword}"...`);

  try {
    const results = await searchRegistry(keyword);

    if (results.length === 0) {
      log.warn(`未找到与 "${keyword}" 匹配的 skill`);
      log.info('提示: 尝试使用更短或更通用的关键词');
      return;
    }

    log.header(`搜索结果 (${results.length})`);

    log.table(
      results.map(r => ({
        name: r.name,
        version: r.version || 'unknown',
        description: truncate(r.description || '', 35),
        author: r.author || '',
      })),
      [
        { key: 'name', label: '名称' },
        { key: 'version', label: '版本' },
        { key: 'description', label: '描述' },
        { key: 'author', label: '作者' },
      ]
    );

    console.log('');
    log.info('安装方式: sdd install <skill-name>');
  } catch (e) {
    log.error(`搜索失败: ${e.message}`);
    process.exit(2);
  }
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len - 1) + '…' : str;
}

module.exports = { run };
