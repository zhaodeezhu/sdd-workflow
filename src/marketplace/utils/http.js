'use strict';

const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Promise-based HTTP(S) GET with redirect support and timeout.
 */
function get(urlStr, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 15000;
    const maxRedirects = options.maxRedirects || 5;

    let redirectCount = 0;

    function makeRequest(targetUrl) {
      const parsed = new URL(targetUrl);
      const lib = parsed.protocol === 'https:' ? https : http;

      const req = lib.get(targetUrl, { timeout }, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          redirectCount++;
          if (redirectCount > maxRedirects) {
            reject(new Error(`重定向次数超过限制 (${maxRedirects})`));
            return;
          }
          const redirectUrl = new URL(res.headers.location, targetUrl).href;
          res.resume(); // drain response
          makeRequest(redirectUrl);
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode}: ${targetUrl}`));
          return;
        }

        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
        res.on('error', reject);
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`请求超时 (${timeout}ms): ${targetUrl}`));
      });
    }

    makeRequest(urlStr);
  });
}

/**
 * GET request returning JSON.
 */
async function getJson(url, options = {}) {
  const res = await get(url, options);
  try {
    return JSON.parse(res.body.toString('utf8'));
  } catch (e) {
    throw new Error(`JSON 解析失败: ${url}`);
  }
}

/**
 * GET request returning text.
 */
async function getText(url, options = {}) {
  const res = await get(url, options);
  return res.body.toString('utf8');
}

/**
 * Download a file to disk.
 */
async function downloadFile(url, destPath, options = {}) {
  const fs = require('fs');
  const { ensureDir } = require('./fs');

  ensureDir(require('path').dirname(destPath));

  const res = await get(url, options);

  return new Promise((resolve, reject) => {
    const stream = require('fs').createWriteStream(destPath);
    stream.write(res.body);
    stream.end();
    stream.on('finish', () => resolve(destPath));
    stream.on('error', reject);
  });
}

module.exports = { get, getJson, getText, downloadFile };
