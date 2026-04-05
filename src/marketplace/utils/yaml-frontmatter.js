'use strict';

/**
 * Parse YAML frontmatter from a markdown file.
 * Only supports simple flat key-value pairs (no nested objects, arrays, or multiline strings).
 *
 * Input:
 *   ---
 *   name: sdd-init
 *   description: Initialize SDD
 *   invocable: true
 *   ---
 *
 * Output:
 *   { name: 'sdd-init', description: 'Initialize SDD', invocable: true }
 */
function parseFrontmatter(content) {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('---')) {
    return { data: {}, body: content };
  }

  const endMatch = trimmed.indexOf('---', 3);
  if (endMatch === -1) {
    return { data: {}, body: content };
  }

  const yaml = trimmed.slice(3, endMatch).trim();
  const body = trimmed.slice(endMatch + 3).trimStart();

  const data = {};
  for (const line of yaml.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Type coercion
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (value === 'null') value = null;
    else if (/^\d+$/.test(value)) value = parseInt(value, 10);

    data[key] = value;
  }

  return { data, body };
}

/**
 * Stringify frontmatter back to markdown.
 */
function stringifyFrontmatter(data, body) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && (value.includes(':') || value.includes('#'))) {
      lines.push(`${key}: "${value}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n') + body;
}

module.exports = { parseFrontmatter, stringifyFrontmatter };
