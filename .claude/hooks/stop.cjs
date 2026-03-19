#!/usr/bin/env node
/**
 * Stop Hook - Claude 回答结束时触发
 * 功能:
 * 1. 清理可能误创建的 nul 文件
 * 2. 播放完成音效（如有）
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 清理可能误创建的 nul 文件（Windows 下 > nul 可能创建该文件）
const findAndDeleteNul = (dir, depth = 0) => {
  if (depth > 5) return;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === 'nul') {
        fs.unlinkSync(fullPath);
        console.error(`已清理: ${fullPath}`);
      } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        findAndDeleteNul(fullPath, depth + 1);
      }
    }
  } catch {
    // 访问失败时静默忽略
  }
};
findAndDeleteNul(process.cwd());

// 播放完成音效
const audioFile = path.join(process.cwd(), '.claude', 'audio', 'completed.wav');
try {
  if (fs.existsSync(audioFile)) {
    const platform = process.platform;
    if (platform === 'darwin') {
      execSync(`afplay "${audioFile}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
    } else if (platform === 'win32') {
      execSync(`powershell -c "(New-Object Media.SoundPlayer '${audioFile.replace(/'/g, "''")}').PlaySync()"`, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } else if (platform === 'linux') {
      try {
        execSync(`aplay "${audioFile}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
      } catch {
        try {
          execSync(`paplay "${audioFile}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
        } catch {
          // 播放失败，静默忽略
        }
      }
    }
  }
} catch {
  // 播放失败时静默忽略
}

process.exit(0);
