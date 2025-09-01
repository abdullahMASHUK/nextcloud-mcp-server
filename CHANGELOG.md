# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-01

### Added
- Initial release of NextCloud MCP Server
- Complete NextCloud WebDAV API integration
- File management operations (list, create, delete, upload, download)
- Share management with support for public links, user shares, and group shares
- Connection testing functionality
- TypeScript implementation with full type safety
- Comprehensive error handling and logging
- Professional npm package structure
- Jest testing framework setup
- ESLint and Prettier configuration

### Changed
- Repository configured for personal management under abdullahMASHUK GitHub account
- GitHub Actions CI/CD pipeline
- Complete documentation and usage examples
- MIT license
- Environment variable configuration support

### Features
- **Connection Testing**: Verify connectivity to NextCloud instances
- **File Operations**: 
  - List files and directories with metadata
  - Create directories
  - Delete files and directories
  - Upload files with base64 encoding
  - Download files with base64 output
- **Share Management**:
  - Create public links with optional password protection
  - Create user and group shares
  - List existing shares with filtering
  - Delete shares by ID
  - Support for expiration dates and notes
- **Security**: Username/password authentication with secure HTTP client
- **Error Handling**: Consistent API response format with detailed error messages
- **TypeScript**: Full type definitions and IntelliSense support

### Technical Details
- Built with TypeScript and ES2022 target
- Uses @modelcontextprotocol/sdk for MCP server implementation
- Axios for HTTP client with proper authentication
- xml2js for parsing WebDAV XML responses
- form-data for multipart form uploads
- Comprehensive Jest test suite
- ESLint and Prettier for code quality
- GitHub Actions for automated testing and publishing

### Supported NextCloud APIs
- WebDAV API for file operations
- OCS Sharing API for share management
- Status API for connection testing

### Browser/Environment Support
- Node.js 18.0.0 or higher
- TypeScript 5.0 or higher
- Works with any NextCloud instance with WebDAV enabled

## [Unreleased]

### Planned
- Additional authentication methods (OAuth, app passwords)
- Bulk file operations
- Advanced sharing permissions
- File versioning support
- Trash/recycle bin operations
- Activity monitoring
- Webhook support
