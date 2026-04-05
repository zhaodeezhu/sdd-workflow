'use strict';

const fs = require('fs');
const path = require('path');
const log = require('../utils/log');
const { readJsonFile, writeJsonFile } = require('../utils/fs');
const { getJson } = require('../utils/http');

const DEFAULT_REGISTRY_URL = 'https://raw.githubusercontent.com/sdd-workflow/sdd-registry/main/registry.json';
const CACHE_FILE = '.registry-cache.json';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get the registry index, using cache when available.
 */
async function getRegistry(options = {}) {
  const projectDir = process.cwd();
  const cachePath = path.join(projectDir, '.specify', CACHE_FILE);
  const registryUrl = options.registryUrl || getRegistryUrl();

  // Try cache first
  if (!options.noCache) {
    const cache = readJsonFile(cachePath);
    if (cache && cache._cachedAt) {
      const age = Date.now() - new Date(cache._cachedAt).getTime();
      if (age < CACHE_TTL) {
        return cache;
      }
    }
  }

  // Fetch from remote
  try {
    const registry = await getJson(registryUrl, { timeout: 15000 });
    registry._cachedAt = new Date().toISOString();
    registry._source = registryUrl;

    // Save cache
    const specifyDir = path.join(projectDir, '.specify');
    if (fs.existsSync(specifyDir)) {
      writeJsonFile(cachePath, registry);
    }

    return registry;
  } catch (e) {
    // Fall back to expired cache
    const cache = readJsonFile(cachePath);
    if (cache) {
      log.warn('无法连接到注册表，使用本地缓存');
      return cache;
    }

    throw new Error(`无法获取注册表: ${e.message}`);
  }
}

/**
 * Get a specific skill from the registry.
 */
async function getSkill(name, options = {}) {
  const registry = await getRegistry(options);
  return registry.skills ? registry.skills[name] : null;
}

/**
 * Search the registry by keyword.
 */
async function search(keyword, options = {}) {
  const registry = await getRegistry(options);
  const skills = registry.skills || {};
  const results = [];

  const kw = keyword.toLowerCase();

  for (const [name, entry] of Object.entries(skills)) {
    const searchable = [
      name,
      entry.description || '',
      ...(entry.keywords || []),
    ].map(s => s.toLowerCase()).join(' ');

    if (searchable.includes(kw)) {
      results.push({ name, ...entry });
    }
  }

  // Sort by relevance (name match first, then keyword match)
  results.sort((a, b) => {
    const aName = a.name.toLowerCase().includes(kw) ? 0 : 1;
    const bName = b.name.toLowerCase().includes(kw) ? 0 : 1;
    return aName - bName;
  });

  return results;
}

/**
 * Get registry URL from config or default.
 */
function getRegistryUrl() {
  // Check for .specify/skill-config.json
  const configPath = path.join(process.cwd(), '.specify', 'skill-config.json');
  const config = readJsonFile(configPath);
  if (config && config.registry) {
    return config.registry;
  }
  return DEFAULT_REGISTRY_URL;
}

module.exports = { getRegistry, getSkill, search, getRegistryUrl, DEFAULT_REGISTRY_URL };
