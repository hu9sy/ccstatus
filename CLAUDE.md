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

This CLI application follows a layered architecture pattern with clear separation of concerns:

### Tech Stack
- **Runtime**: Bun with TypeScript (ESNext target)
- **Module System**: ESModules with `.ts` import extensions
- **CLI Framework**: gunshi for command routing and argument parsing
- **UI**: consola (colored output), cli-table3 (table formatting)
- **API**: Anthropic Status API (https://status.anthropic.com/api/v2/)

### Architectural Patterns

**Layered Architecture:**
```
src/
├── index.ts              # Entry point (delegates to command/index.ts)
├── command/              # Command layer (CLI interface)
│   ├── index.ts         # gunshi CLI setup and routing
│   ├── service.ts       # Service status command (default)
│   └── incident.ts      # Incident history command
├── lib/                  # Shared library layer
│   ├── types.ts         # TypeScript type definitions
│   ├── messages.ts      # UI messages and localization
│   ├── constants.ts     # API endpoints and app constants
│   ├── utils.ts         # Formatting and utility functions
│   ├── error-handler.ts # Centralized error handling
│   ├── table-builder.ts # Table creation utilities
│   ├── base-command.ts  # Abstract base for commands
│   ├── cache.ts         # Caching functionality
│   ├── config.ts        # Configuration management
│   ├── logger.ts        # Logging utilities
│   └── service-container.ts # Dependency injection container
├── presenters/           # Presentation layer (UI formatting)
│   ├── service-presenter.ts  # Service status display logic
│   └── incident-presenter.ts # Incident display logic
└── services/             # Service layer (API communication)
    └── status-service.ts # Anthropic Status API client
```

**Design Patterns:**
- **Command Pattern**: Each CLI command is a separate module with gunshi
- **Presenter Pattern**: UI logic separated from business logic
- **Service Pattern**: API communication abstracted into service classes
- **Error Handler Pattern**: Centralized error handling with consistent UI

## Development Configuration

### TypeScript Setup
- **Target**: ESNext with bundler module resolution
- **Features**: Strict mode, `allowImportingTsExtensions: true`
- **Import Style**: Use `.ts` extensions for internal modules (not `.js`)
- **No Emit**: Runtime execution via Bun, no compilation step needed

### Code Quality
- **Linting**: ESLint with TypeScript integration
- **Rules**: Configured for CLI development with flexible unused variable handling
- **Formatting**: Automatic via ESLint

### Japanese Localization
- All UI messages centralized in `src/lib/messages.ts`
- Dual time display: JST (primary) and UTC (secondary)
- Status and error messages in Japanese

### API Integration
- Fetches from Anthropic Status API v2 endpoints
- Endpoints defined in `src/lib/constants.ts`
- Error handling with Japanese user-friendly messages

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
