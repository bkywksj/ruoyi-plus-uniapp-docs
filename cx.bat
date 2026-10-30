@echo off
REM next-ai-astro: start Codex in this project without approvals (autonomous rounds).
REM Hooks still run: .codex/hooks/pre-tool-use.cjs blocks dangerous and remote git commands.
cd /d "%~dp0"
codex --dangerously-bypass-approvals-and-sandbox %*
