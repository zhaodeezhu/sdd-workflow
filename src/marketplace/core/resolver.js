'use strict';

const log = require('../utils/log');

/**
 * Resolve skill dependencies using topological sort.
 * Returns an ordered list of skills to install (no-deps first).
 *
 * @param {string} skillName - The skill to resolve
 * @param {object} getManifest - Function that returns a manifest for a skill name
 * @param {object} installed - Map of already-installed skill names to versions
 * @param {number} maxDepth - Maximum recursion depth (default 10)
 */
function resolve(skillName, getManifest, installed = {}, maxDepth = 10) {
  // Phase 1: Build dependency graph
  const graph = {};
  const manifests = {};
  const toVisit = [skillName];
  const visited = new Set();

  while (toVisit.length > 0) {
    const current = toVisit.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    const manifest = getManifest(current);
    if (!manifest) {
      log.warn(`未找到 skill 元数据: ${current}`);
      graph[current] = [];
      continue;
    }

    manifests[current] = manifest;
    const deps = manifest.dependencies ? Object.keys(manifest.dependencies) : [];
    graph[current] = deps;

    for (const dep of deps) {
      if (!visited.has(dep)) {
        toVisit.push(dep);
      }
    }

    if (visited.size > maxDepth * 5) {
      throw new Error(`依赖图过大，可能存在循环依赖`);
    }
  }

  // Phase 2: Detect cycles using DFS coloring
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const colors = {};
  for (const node of Object.keys(graph)) {
    colors[node] = WHITE;
  }

  function detectCycle(node, path) {
    colors[node] = GRAY;
    path.push(node);

    for (const dep of graph[node] || []) {
      if (!colors[dep]) continue; // dep not in our graph, skip

      if (colors[dep] === GRAY) {
        // Found cycle
        const cycleStart = path.indexOf(dep);
        const cycle = path.slice(cycleStart).concat([dep]);
        return cycle;
      }

      if (colors[dep] === WHITE) {
        const cycle = detectCycle(dep, path);
        if (cycle) return cycle;
      }
    }

    colors[node] = BLACK;
    path.pop();
    return null;
  }

  for (const node of Object.keys(graph)) {
    if (colors[node] === WHITE) {
      const cycle = detectCycle(node, []);
      if (cycle) {
        throw new Error(`检测到循环依赖: ${cycle.join(' → ')}`);
      }
    }
  }

  // Phase 3: Topological sort (Kahn's algorithm)
  const inDegree = {};
  for (const node of Object.keys(graph)) {
    if (!(node in inDegree)) inDegree[node] = 0;
    for (const dep of graph[node] || []) {
      inDegree[dep] = (inDegree[dep] || 0) + 1;
    }
  }

  const queue = [];
  for (const node of Object.keys(graph)) {
    if (inDegree[node] === 0) {
      queue.push(node);
    }
  }

  const installOrder = [];
  while (queue.length > 0) {
    const node = queue.shift();
    installOrder.push(node);

    for (const dep of graph[node] || []) {
      inDegree[dep]--;
      if (inDegree[dep] === 0) {
        queue.push(dep);
      }
    }
  }

  if (installOrder.length !== Object.keys(graph).length) {
    throw new Error('依赖解析失败：图中存在未解决的循环');
  }

  // Phase 4: Filter out already-installed skills
  const toInstall = installOrder.filter(name => {
    if (installed[name]) {
      // Check version compatibility
      const manifest = manifests[name];
      if (manifest && manifest.dependencies) {
        for (const [depName, versionRange] of Object.entries(manifest.dependencies)) {
          if (installed[depName] && !satisfiesVersion(installed[depName], versionRange)) {
            log.warn(`${name} 需要 ${depName}@${versionRange}，当前安装 ${installed[depName]}`);
          }
        }
      }
      return false;
    }
    return true;
  });

  return {
    installOrder,
    toInstall,
    manifests,
    graph,
  };
}

/**
 * Minimal semver range check.
 * Supports: exact match, ^, ~, >=, *
 */
function satisfiesVersion(version, range) {
  if (!range || range === '*') return true;

  // Exact match
  if (!/^[~^>=]/.test(range)) {
    return version === range;
  }

  const [vMajor, vMinor, vPatch] = version.split('.').map(Number);
  const rangeParts = range.replace(/^[~^>=]+/, '').split('.').map(Number);

  if (range.startsWith('^')) {
    // Compatible with major version
    if (rangeParts[0] !== undefined && vMajor !== rangeParts[0]) return false;
    if (rangeParts[1] !== undefined && vMinor < rangeParts[1]) return false;
    if (rangeParts[1] !== undefined && vMinor === rangeParts[1] && rangeParts[2] !== undefined && vPatch < rangeParts[2]) return false;
    return true;
  }

  if (range.startsWith('~')) {
    // Compatible with major.minor
    if (rangeParts[0] !== undefined && vMajor !== rangeParts[0]) return false;
    if (rangeParts[1] !== undefined && vMinor !== rangeParts[1]) return false;
    if (rangeParts[2] !== undefined && vPatch < rangeParts[2]) return false;
    return true;
  }

  if (range.startsWith('>=')) {
    const v = [vMajor, vMinor, vPatch];
    const r = rangeParts;
    for (let i = 0; i < 3; i++) {
      if ((v[i] || 0) > (r[i] || 0)) return true;
      if ((v[i] || 0) < (r[i] || 0)) return false;
    }
    return true;
  }

  return version === range;
}

module.exports = { resolve, satisfiesVersion };
