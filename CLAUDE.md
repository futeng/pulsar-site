# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Apache Pulsar website and documentation repository** - the official source code for https://pulsar.apache.org. Apache Pulsar is an open-source, distributed messaging and streaming platform built for the cloud.

## Technology Stack

- **Framework**: Docusaurus 3.8.1 (React-based static site generator)
- **Language**: TypeScript/JavaScript with MDX for documentation
- **Package Manager**: Yarn 3.5.0 (with corepack)
- **Node Version**: >= 18.0
- **UI Libraries**: Material-UI v6, Bootstrap 5
- **Search**: Algolia search integration
- **Analytics**: Matomo

## Essential Development Commands

```bash
# Primary development workflow - starts local server on port 3000
./preview.sh

# Clean build (clears cache first)
./preview.sh --clean

# Build specific versions
./preview.sh 4.1.x 4.0.x

# Alternative yarn commands
yarn start          # Development server
yarn build         # Production build
yarn typecheck     # TypeScript validation
yarn clear         # Clear Docusaurus cache
```

## Multi-Version Documentation Management

This site maintains documentation for 25+ Pulsar versions. Key commands:

```bash
# List all supported versions
./scripts/docs-tool.sh supported_versions

# Apply changes from docs/ to versioned_docs/
./scripts/docs-tool.sh apply_changes_to_versioned_docs

# Create new documentation version
yarn version
```

## Architecture & Directory Structure

### Core Content Areas
- `docs/` - Main documentation files (versioned content)
- `versioned_docs/` - Version-specific documentation copies
- `blog/` - Blog posts (2018-2025)
- `contribute/` - Community contribution guides
- `release-notes/` - Release documentation
- `security/` - Security documentation
- `client-feature-matrix/` - Client library feature comparisons

### Application Code
- `src/components/` - Custom React components (download pages, release tables, feature matrices)
- `src/pages/` - Custom page components
- `src/theme/` - Docusaurus theme overrides
- `src/server/` - Server-side utilities and remark plugins
- `src/css/` - Custom CSS stylesheets

### Configuration & Data
- `docusaurus.config.ts` - Main Docusaurus configuration (554 lines)
- `sidebars.json` - Navigation structure
- `versions.json` - Supported version list
- `data/` - Data files and configurations
- `static/` - Static assets (images, CSS, JS)

### Build & Maintenance
- `scripts/` - Build and maintenance scripts
- `tools/` - Additional utility tools
- `preview.sh` - Development server script

## Key Features

### Documentation Features
- **Multi-version support**: Maintains docs for versions 4.1.x back to 2.2.0
- **Dynamic content injection**: Custom `{@inject:}` syntax for API links
- **Interactive elements**: Code playgrounds, live examples
- **Math support**: KaTeX integration for mathematical notation
- **Advanced search**: Algolia search with custom indexing

### Custom Components
- Download pages with version selection tables
- Release comparison matrices for client libraries
- Interactive feature comparison tools
- Custom navigation and sidebar components

## Development Workflow

1. **For documentation changes**: Edit files in `docs/` directory
2. **For version updates**: Use `scripts/docs-tool.sh` for multi-version updates
3. **For UI changes**: Modify components in `src/components/`
4. **For new features**: Add custom plugins in `docusaurus.config.ts`
5. **For content management**: Use provided Python scripts in `/scripts`

## Important Notes

- Uses Yarn 3.5.0 with corepack - run `corepack enable` if yarn is unavailable
- Node.js >= 18.0 required
- Build process requires increased memory allocation (16GB) via NODE_OPTIONS
- No formal test framework - use `yarn typecheck` and `yarn build` for validation
- Version-specific changes must be applied to both `docs/` and `versioned_docs/` directories

## Troubleshooting

If the live website doesn't update after commits, the asf-site-next branch may need history reset:
```bash
git clone -b asf-site-next https://github.com/apache/pulsar-site pulsar-site-static
cd pulsar-site-static
git checkout --orphan asf-site-next-reset
git add -A
git commit -m "History resetted"
git push -f HEAD:asf-site-next
```