# Interactive Terminal CLI Design

## Overview
Make the landing page terminal interactive. Visitors click into it and type commands. Supports tab completion, command history, and a handful of FrawdBot-themed commands.

## Commands

| Command | Output |
|---------|--------|
| `help` | Lists all available commands with descriptions |
| `status` | Shows frawdbot --status output |
| `defend` | Launches the easter egg game |
| `scan` | Fake scan animation with progress bar, then "No threats detected" |
| `version` | FrawdBot v0.2 · Built by Self-Improving Code |
| `clear` | Clears terminal output |
| Unknown | `frawdbot: command not found. Type 'help' for available commands.` |

## Interaction
- Prompt: `$ ` in green
- Tab completion cycles matching commands
- Up/down arrow navigates history (last 20)
- Auto-scroll to keep cursor visible
- Click terminal to focus
- Initial state: current status output + prompt
- Game exit returns to CLI with prompt

## No Changes To
- Page layout, styling, content outside terminal
- Mobile touch controls, triple-click activation, frawdbot.play() API
