# NextCloud MCP Server

A professional Model Context Protocol (MCP) server for NextCloud integration, providing file management and sharing capabilities.

## Features

-  File and directory operations (list, upload, download, create, delete, move)
-  Share management (create, list, update, delete shares)
-  Secure authentication with environment variables
-  Complete TypeScript implementation
-  Comprehensive test coverage
-  Ready for npm publishing

## Installation

### From NPM (when published)
```bash
npm install -g nextcloud-mcp-server
```

### From Source
```bash
git clone https://github.com/abdullahMASHUK/nextcloud-mcp-server.git
cd nextcloud-mcp-server
npm install
npm run build
```

## Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your NextCloud credentials:
```bash
NEXTCLOUD_URL=https://your-nextcloud-server.com
NEXTCLOUD_USERNAME=your-username
NEXTCLOUD_PASSWORD=your-password
```

## Usage

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nextcloud": {
      "command": "node",
      "args": ["path/to/nextcloud-mcp-server/build/index.js"],
      "env": {
        "NEXTCLOUD_URL": "https://your-nextcloud-server.com",
        "NEXTCLOUD_USERNAME": "your-username", 
        "NEXTCLOUD_PASSWORD": "your-password"
      }
    }
  }
}
```

### With Other MCP Clients

Run the server using stdio transport:
```bash
node build/index.js
```

## Available Tools

### File Operations
- `list-files` - List files and directories
- `download-file` - Download a file from NextCloud  
- `upload-file` - Upload a file to NextCloud
- `create-directory` - Create a new directory
- `delete-file` - Delete a file or directory
- `move-file` - Move/rename files and directories

### Share Operations  
- `create-share` - Create a new share (public/user/group)
- `list-shares` - List existing shares
- `update-share` - Update share settings
- `delete-share` - Delete a share

### Utility Tools
- `test-connection` - Test connectivity to NextCloud server

## Development

### Prerequisites
- Node.js 18+
- TypeScript 
- NextCloud server with WebDAV access

### Setup
```bash
npm install
npm run dev  # Run in development mode
npm run build  # Build for production
npm run test  # Run tests
npm run lint  # Check code style
```

### Project Structure
```
src/
 index.ts          # Main server entry point
 types.ts          # TypeScript type definitions
 services/         # Service layer
    nextcloud.ts  # NextCloud API client
 tools/            # MCP tool implementations
 utils/            # Utility functions
```

## API Documentation

### File Operations

#### list-files
Lists files and directories in the specified path.

**Parameters:**
- `path` (string, optional): Directory path to list (default: "/")

#### download-file  
Downloads a file from NextCloud.

**Parameters:**
- `path` (string): File path to download

#### upload-file
Uploads a file to NextCloud.

**Parameters:**
- `path` (string): Target path for upload
- `content` (string): File content (base64 encoded)
- `overwrite` (boolean, optional): Whether to overwrite existing files

### Share Operations

#### create-share
Creates a new share for a file or directory.

**Parameters:**
- `path` (string): Path to share
- `shareType` (string): Type of share ("public", "user", "group")
- `shareWith` (string, optional): Username/group for user/group shares
- `password` (string, optional): Password protection
- `permissions` (number, optional): Permission level
- `expiration` (string, optional): Expiration date (YYYY-MM-DD)

## Security

- Never commit `.env` files with real credentials
- Use application passwords instead of main account passwords
- Limit permissions for MCP integration users
- Regularly review and rotate credentials

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For issues and questions:
- GitHub Issues: [repository-issues-url]
- Documentation: [docs-url]

## Changelog

### 1.0.0
- Initial release
- Basic file operations
- Share management
- TypeScript implementation
- Test coverage
