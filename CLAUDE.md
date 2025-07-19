# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ccstatus is a CLI tool for monitoring Claude Code service status. It uses the Anthropic Status API to display real-time service information and incident history in Japanese.

## Commands

```bash
# Install dependencies
bun install

# Run the main application (shows service status)
bun run index.ts

# Run with specific command (incidents)
bun run index.ts incident --limit 5

# Lint code
bun run lint
```

## Architecture

This is a CLI application built with:
- **Framework**: gunshi (CLI framework)
- **Runtime**: Bun with TypeScript
- **UI Libraries**: consola for logging/UI, cli-table3 for table display

### Directory Structure

- `src/index.ts` - Main entry point (delegates to commands)
- `src/command/` - CLI command implementations
  - `index.ts` - CLI setup with gunshi framework
  - `service.ts` - Service status display (default command)
  - `incident.ts` - Incident history display

### Key Dependencies

- **gunshi**: CLI framework handling command routing and argument parsing
- **consola**: Provides colored output and UI elements
- **cli-table3**: Renders status information in table format

## Development Notes

- Uses ESModules (`"type": "module"` in package.json)
- TypeScript with strict mode enabled
- Japanese UI with UTC/JST time display
- Fetches data from https://status.anthropic.com/api/v2/ endpoints
