# AfnoUI CLI Documentation

**Complete CLI for installing and managing UI components from AfnoUI registry.**

## 🚀 Quick Start

### Installation
```bash
npm install -g afnoui
```

### Initialize Your Project
```bash
afnoui init
```

### Add Components
```bash
afnoui add button card input
```

### List Available Components
```bash
afnoui list
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [CLI-USAGE.md](./CLI-USAGE.md) | Complete command reference and examples |
| [CONFIGURATION.md](./CONFIGURATION.md) | Configuration options and customization |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and solutions |

---

## 🔧 Key Features

- ✅ **Automatic Tailwind Detection** - Supports both v3 and v4
- ✅ **Smart Configuration** - Auto-detects project structure
- ✅ **Dependency Management** - Installs npm packages automatically
- ✅ **Path Aliases** - Customizable import paths
- ✅ **Network Resilience** - Circuit breaker and retry logic
- ✅ **Caching** - 1-hour cache for faster subsequent runs
- ✅ **File Locking** - Prevents concurrent installations
- ✅ **Backup & Rollback** - Safe updates with automatic rollback
- ✅ **Dry Run Mode** - Preview changes before applying them

---

## 🎨 Supported Components

All components from the AfnoUI registry are supported. Use `afnoui list` to see all available components.

---

## 📋 Configuration

CLI creates `afnoui.json` in your project root with customizable settings:

```json
{
  "version": "1.0.0",
  "aliasPrefix": "@/",
  "isV4": true,
  "aliases": {
    "components": "components/ui",
    "utils": "lib/utils",
    "hooks": "hooks",
    "ui": "components/ui"
  }
}
```

**Configuration Options:**
- **Tailwind Version**: Auto-detected (v3 vs v4)
- **TypeScript**: Auto-detected (generates `.ts` or `.js` config)
- **Source Directory**: Auto-detected (`src/` or root)
- **Path Aliases**: Customizable import paths
- **Development Mode**: Set `NODE_ENV=development` for local registry

See [CONFIGURATION.md](./CONFIGURATION.md) for complete configuration guide.

---

## 🌐 Environments

| Environment | Registry URL | Tailwind Setup |
|-------------|---------------|---------------|
| **Production** (default) | `https://afnoui.aniketrouniyar.com.np/registry` | Uses `@theme` block in CSS |
| **Development** | `http://localhost:3000/registry` | Uses `@theme` block in CSS |

To use development mode:
```bash
NODE_ENV=development afnoui add button
```

---

## 🚨 Troubleshooting

### Common Issues

**1. Component already exists**
```bash
afnoui add button --force
```

**2. Registry connectivity issues**
```bash
afnoui doctor
```

**3. Duplicate installations**
CLI automatically prevents duplicate installations using tracking.

**4. Network failures**
CLI includes circuit breaker and exponential backoff for reliability.

**5. Configuration issues**
```bash
afnoui diagnose  # Auto-repair common issues
```

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for complete troubleshooting guide.

---

## 🔒 Security & Safety

- ✅ **File Locking** - Prevents race conditions during installation
- ✅ **Backup Creation** - Automatic backups before overwriting files
- ✅ **Rollback on Failure** - Restores backups on installation errors
- ✅ **Duplicate Prevention** - Tracks installed components globally
- ✅ **Validation** - Validates registry items before installation

---

## 📊 Performance

- **Caching**: 1-hour cache for registry data
- **Parallel Processing**: Fetches multiple components concurrently
- **Smart Dependency Management**: Installs all dependencies at once
- **Incremental Installation**: Installs registry dependencies recursively

---

## 🤝 Contributing

For development and contribution guidelines, visit: https://github.com/afnoui/afnoui

---

## 📄 License

See [package.json](../package.json) for license information.

---

## 🎓 Getting Help

```bash
afnoui help
# Show all available commands

afnoui help <command>
# Show help for specific command
```

---

## 🚀 Quick Reference

### Common Commands

| Command | Description |
|---------|-------------|
| `afnoui init` | Initialize AfnoUI in your project |
| `afnoui add` | Add components to your project |
| `afnoui update` | Update components to latest version |
| `afnoui list` | List all available components |
| `afnoui doctor` | Check if Tailwind and CSS are configured correctly |
| `afnoui diagnose` | Run diagnostics and auto-repair common issues |
| `afnoui clean` | Remove AfnoUI components and configuration |

### Global Options

| Option | Description |
|---------|-------------|
| `--dry-run` | Preview changes without applying them |
| `--debug` | Enable debug output for troubleshooting |
| `--force` | Force overwrite existing files |

---

**Need help?** Check the detailed documentation in [CLI-USAGE.md](./CLI-USAGE.md) or run `afnoui help <command>`.
