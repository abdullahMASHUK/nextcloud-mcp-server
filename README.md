<div align="center">

# 🌐 NextCloud MCP Server

[![npm version](https://badge.fury.io/js/nextcloud-mcp-server.svg)](https://badge.fury.io/js/nextcloud-mcp-server)
[![Downloads](https://img.shields.io/npm/dm/nextcloud-mcp-server.svg)](https://www.npmjs.com/package/nextcloud-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**A professional Model Context Protocol (MCP) server for seamless NextCloud integration**

*Empower your AI agents with comprehensive NextCloud file management and sharing capabilities*

[Installation](#-installation) • [Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [Security](#-security)

</div>

---

## 🚀 Features

<div align="center">

| 📁 **File Management** | 🔗 **Sharing** | 🔒 **Security** | 🛠️ **Developer Experience** |
|-------------------------|-----------------|------------------|------------------------------|
| List, upload, download | Public links | App passwords | Full TypeScript support |
| Create directories | User/group shares | Environment variables | Comprehensive tests |
| Delete files/folders | Password protection | Secure authentication | Professional documentation |
| Move and rename | Expiration dates | HTTPS enforcement | Easy integration |

</div>

### ✨ Key Capabilities

- 🎯 **9 Comprehensive Tools** - Complete file operations and sharing management
- 🔐 **Enhanced Security** - Built-in app password support and best practices
- 🏗️ **Professional Architecture** - TypeScript-first with full type safety
- 📚 **Rich Documentation** - Detailed guides and examples
- 🔄 **WebDAV Integration** - Native NextCloud protocol support
- ⚡ **High Performance** - Optimized for speed and reliability
- 🌍 **Universal Compatibility** - Works with any NextCloud instance

---

## 📦 Installation

### From NPM (Recommended)

```bash
# Install globally for CLI usage
npm install -g nextcloud-mcp-server

# Or install locally in your project
npm install nextcloud-mcp-server
```

### From Source

```bash
git clone https://github.com/abdullahMASHUK/nextcloud-mcp-server.git
cd nextcloud-mcp-server
npm install
npm run build
```

---

## 🚀 Quick Start

### 1. 🔐 Setup App Password (Recommended)

<details>
<summary>Click to expand security setup instructions</summary>

For enhanced security, create a dedicated app password:

1. **Navigate to NextCloud Settings**
   ```
   NextCloud → Settings → Security → App passwords
   ```

2. **Create New App Password**
   - Enter name: `MCP Server`
   - Click "Create new app password"
   - Copy the generated password: `xxxxx-xxxxx-xxxxx-xxxxx-xxxxx`

3. **Why App Passwords?**
   - ✅ Limited scope and permissions
   - ✅ Can be revoked independently
   - ✅ No access to your main account
   - ✅ Auditable access logs

</details>

### 2. ⚙️ Configuration

```bash
# Copy the environment template
cp .env.example .env
```

Edit your `.env` file:

```bash
NEXTCLOUD_URL=https://your-nextcloud-server.com
NEXTCLOUD_USERNAME=your-username
NEXTCLOUD_PASSWORD=your-app-password-here  # Use app password!
```

### 3. 🎮 Usage with MCP Clients

<details>
<summary>Claude Desktop Configuration</summary>

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nextcloud": {
      "command": "nextcloud-mcp-server",
      "env": {
        "NEXTCLOUD_URL": "https://your-nextcloud-server.com",
        "NEXTCLOUD_USERNAME": "your-username",
        "NEXTCLOUD_PASSWORD": "your-app-password"
      }
    }
  }
}
```

</details>

<details>
<summary>Direct Usage</summary>

```bash
# Run the MCP server
nextcloud-mcp-server

# Or with Node.js
node build/index.js
```

</details>

---

## 🛠️ Available Tools

### 📁 File Operations

<table>
<tr>
<td><strong>🔍 test-connection</strong></td>
<td>Test connectivity to your NextCloud server</td>
</tr>
<tr>
<td><strong>📋 list-files</strong></td>
<td>List files and directories with metadata</td>
</tr>
<tr>
<td><strong>📁 create-directory</strong></td>
<td>Create new directories in NextCloud</td>
</tr>
<tr>
<td><strong>🗑️ delete-file</strong></td>
<td>Delete files or directories</td>
</tr>
<tr>
<td><strong>⬆️ upload-file</strong></td>
<td>Upload files with base64 encoding</td>
</tr>
<tr>
<td><strong>⬇️ download-file</strong></td>
<td>Download files from NextCloud</td>
</tr>
</table>

### 🔗 Sharing Operations

<table>
<tr>
<td><strong>🌐 create-share</strong></td>
<td>Create public links, user, or group shares</td>
</tr>
<tr>
<td><strong>📤 list-shares</strong></td>
<td>List and filter existing shares</td>
</tr>
<tr>
<td><strong>🗑️ delete-share</strong></td>
<td>Remove shares by ID</td>
</tr>
</table>

---

## 📖 Documentation

### 🎯 Tool Examples

<details>
<summary><strong>📋 List Files</strong></summary>

```json
{
  "name": "list-files",
  "arguments": {
    "path": "/Documents"
  }
}
```

**Response:** Returns array of files with metadata (name, size, type, modification date)

</details>

<details>
<summary><strong>⬆️ Upload File</strong></summary>

```json
{
  "name": "upload-file",
  "arguments": {
    "remotePath": "/documents/report.pdf",
    "content": "JVBERi0xLjQK..."  // base64 encoded content
  }
}
```

</details>

<details>
<summary><strong>🌐 Create Share</strong></summary>

```json
{
  "name": "create-share",
  "arguments": {
    "path": "/Documents/presentation.pptx",
    "shareType": 3,
    "password": "secure123",
    "expireDate": "2024-12-31",
    "note": "Shared for team review"
  }
}
```

**Share Types:**
- `0` - User share
- `1` - Group share  
- `3` - Public link
- `4` - Email share

</details>

### 🏗️ Development

<details>
<summary>Setup Development Environment</summary>

```bash
# Clone and install
git clone https://github.com/abdullahMASHUK/nextcloud-mcp-server.git
cd nextcloud-mcp-server
npm install

# Development commands
npm run dev          # Run with auto-reload
npm run build        # Build TypeScript
npm run test         # Run test suite
npm run lint         # Check code quality
npm run format       # Format code
```

**Project Structure:**
```
src/
├── index.ts              # Main MCP server
├── services/
│   └── nextcloud.ts      # NextCloud API client
├── types.ts              # TypeScript definitions
└── utils/                # Utility functions

__tests__/                # Test suites
build/                    # Compiled output
```

</details>

---

## 🔒 Security

### 🛡️ Best Practices

<div align="center">

| ✅ **Do** | ❌ **Don't** |
|-----------|--------------|
| Use app passwords | Use main account password |
| Store in environment variables | Hardcode credentials |
| Use HTTPS URLs | Use HTTP connections |
| Rotate passwords regularly | Keep old passwords |
| Monitor access logs | Ignore security events |

</div>

### 🔐 Security Features

- **🔑 App Password Integration** - Dedicated authentication tokens
- **🌐 HTTPS Enforcement** - Secure connections required
- **📝 Environment Variables** - Safe credential storage
- **🔍 Error Handling** - No credential exposure in logs
- **🛡️ Permission Scoping** - Limited access rights

### ⚠️ Security Checklist

- [ ] App password created and configured
- [ ] HTTPS enabled on NextCloud server
- [ ] Environment variables properly set
- [ ] `.env` file added to `.gitignore`
- [ ] Regular password rotation scheduled

---

## License

MIT License - see LICENSE file for details.

## 🤝 Contributing

<div align="center">

### We Welcome Contributions! 

[![Contributors Welcome](https://img.shields.io/badge/contributors-welcome-brightgreen.svg)](https://github.com/abdullahMASHUK/nextcloud-mcp-server/blob/main/CONTRIBUTING.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/abdullahMASHUK/nextcloud-mcp-server/pulls)

</div>

<details>
<summary>🚀 <strong>How to Contribute</strong></summary>

1. **🍴 Fork the repository**
2. **🌿 Create your feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **💻 Make your changes**
4. **✅ Add tests for new features**
5. **🧪 Run the test suite**
   ```bash
   npm run test
   npm run lint
   ```
6. **📝 Commit your changes**
   ```bash
   git commit -m "✨ Add amazing feature"
   ```
7. **🚀 Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **🔄 Open a Pull Request**

</details>

### 💡 Ways to Contribute

<table>
<tr>
<td align="center">🐛<br><strong>Bug Reports</strong></td>
<td align="center">✨<br><strong>Feature Requests</strong></td>
<td align="center">📚<br><strong>Documentation</strong></td>
<td align="center">🧪<br><strong>Testing</strong></td>
</tr>
<tr>
<td align="center">Found an issue?<br>Report it!</td>
<td align="center">Have an idea?<br>Share it!</td>
<td align="center">Improve docs<br>and examples</td>
<td align="center">Add tests and<br>improve coverage</td>
</tr>
</table>

---

## 💖 Support

<div align="center">

### Show Your Support! ⭐

If this project helped you, please consider giving it a ⭐ on GitHub!

[![GitHub stars](https://img.shields.io/github/stars/abdullahMASHUK/nextcloud-mcp-server?style=social)](https://github.com/abdullahMASHUK/nextcloud-mcp-server/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/abdullahMASHUK/nextcloud-mcp-server?style=social)](https://github.com/abdullahMASHUK/nextcloud-mcp-server/network/members)

### 🗣️ Get Help

- 📖 [Documentation](https://github.com/abdullahMASHUK/nextcloud-mcp-server#readme)
- 🐛 [Report Issues](https://github.com/abdullahMASHUK/nextcloud-mcp-server/issues)
- 💬 [Discussions](https://github.com/abdullahMASHUK/nextcloud-mcp-server/discussions)
- 📧 [Contact Maintainer](https://github.com/abdullahMASHUK)

### 🔗 Connect With Us

[![GitHub](https://img.shields.io/badge/GitHub-abdullahMASHUK-181717?style=flat&logo=github)](https://github.com/abdullahMASHUK)
[![npm](https://img.shields.io/badge/npm-nextcloud--mcp--server-CB3837?style=flat&logo=npm)](https://www.npmjs.com/package/nextcloud-mcp-server)

</div>

---

## 📜 License

<div align="center">

**MIT License** © 2024 [Abdullah MASHUK](https://github.com/abdullahMASHUK)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*Permission is hereby granted, free of charge, to any person obtaining a copy of this software...*

[📖 Read Full License](./LICENSE)

</div>

---

## 📈 Changelog

<details>
<summary><strong>Version History</strong></summary>

### 🎉 v1.0.3
- 🎨 Beautified README with professional formatting and visual enhancements
- 📊 Added interactive tables, badges, and collapsible sections
- 👤 Updated author information and git configuration
- 🔗 Enhanced navigation with emojis and better organization
- ✨ Improved user experience for npm and GitHub viewers

### 🚀 v1.0.2
- ✨ Enhanced documentation and README
- 🔒 Added comprehensive security guidelines
- 📝 Improved TypeScript definitions
- 🐛 Bug fixes and stability improvements

### 🚀 v1.0.1
- 📚 Updated documentation
- 🔧 Configuration improvements
- 🛠️ Build process optimization

### 🌟 v1.0.0
- 🎊 Initial release
- 📁 Basic file operations (list, upload, download, delete)
- 🔗 Share management (create, list, delete)
- 🔧 TypeScript implementation
- ✅ Comprehensive test coverage
- 📖 Full documentation

</details>

---

<div align="center">

**Made with ❤️ by [Abdullah MASHUK](https://github.com/abdullahMASHUK)**

*Building bridges between NextCloud and AI assistants* 🌉

[![Built with TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Powered by MCP](https://img.shields.io/badge/Powered%20by-MCP-FF6B6B?style=flat)](https://modelcontextprotocol.io/)

</div>
