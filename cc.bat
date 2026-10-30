@echo off
REM next-ai-astro: start Claude Code in this project without permission prompts (for /loop /dev-loop).
REM Hooks still run: .claude/hooks/pre-tool-use.cjs blocks dangerous and remote git commands.
REM For supervised work, run plain "claude" instead; .claude/settings.json already allows common safe commands.
cd /d "%~dp0"
claude --dangerously-skip-permissions %*
