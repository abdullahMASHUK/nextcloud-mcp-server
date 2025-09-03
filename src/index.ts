#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { NextCloudService } from './services/nextcloud.js';
import { NextCloudConfig } from './types.js';
import * as fs from 'fs';

// Load configuration
function loadConfig(): NextCloudConfig {
  // Try to load from environment variables first
  if (process.env.NEXTCLOUD_URL) {
    return {
      baseUrl: process.env.NEXTCLOUD_URL,
      username: process.env.NEXTCLOUD_USERNAME || '',
      password: process.env.NEXTCLOUD_PASSWORD || ''
    };
  }

  // Try to load from .env file
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/['"]/g, '');
      }
    });

    return {
      baseUrl: envVars.NEXTCLOUD_URL || '',
      username: envVars.NEXTCLOUD_USERNAME || '',
      password: envVars.NEXTCLOUD_PASSWORD || ''
    };
  } catch (configError) {
    console.error('No configuration found. Please set environment variables or create .env file.');
    process.exit(1);
  }
}

const config = loadConfig();
const nextcloud = new NextCloudService(config);

// Create server instance
const server = new Server(
  {
    name: 'nextcloud-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'test-connection',
        description: 'Test connection to NextCloud server',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list-files',
        description: 'List files and directories in NextCloud',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to list (default: /)',
              default: '/',
            },
          },
        },
      },
      {
        name: 'create-directory',
        description: 'Create a new directory in NextCloud',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path of the directory to create',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'delete-file',
        description: 'Delete a file or directory from NextCloud',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path of the file or directory to delete',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'upload-file',
        description: 'Upload a file to NextCloud',
        inputSchema: {
          type: 'object',
          properties: {
            remotePath: {
              type: 'string',
              description: 'Remote path where to upload the file',
            },
            content: {
              type: 'string',
              description: 'Base64 encoded file content',
            },
          },
          required: ['remotePath', 'content'],
        },
      },
      {
        name: 'download-file',
        description: 'Download a file from NextCloud',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path of the file to download',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'create-share',
        description: 'Create a share link for a file or directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path of the file or directory to share',
            },
            shareType: {
              type: 'number',
              description: 'Share type (0=user, 1=group, 3=public link, 4=email)',
              default: 3,
            },
            shareWith: {
              type: 'string',
              description: 'Username, group name, or email to share with (not needed for public links)',
            },
            permissions: {
              type: 'number',
              description: 'Permissions for the share (1=read, 2=update, 4=create, 8=delete, 16=share)',
              default: 1,
            },
            password: {
              type: 'string',
              description: 'Password protection for the share',
            },
            expireDate: {
              type: 'string',
              description: 'Expiration date (YYYY-MM-DD)',
            },
            note: {
              type: 'string',
              description: 'Note for the share',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'list-shares',
        description: 'List existing shares',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Filter shares by path (optional)',
            },
          },
        },
      },
      {
        name: 'delete-share',
        description: 'Delete an existing share',
        inputSchema: {
          type: 'object',
          properties: {
            shareId: {
              type: 'string',
              description: 'ID of the share to delete',
            },
          },
          required: ['shareId'],
        },
      },
      {
        name: 'move-file',
        description: 'Move or rename a file or directory in NextCloud',
        inputSchema: {
          type: 'object',
          properties: {
            sourcePath: {
              type: 'string',
              description: 'Current path of the file or directory',
            },
            destinationPath: {
              type: 'string',
              description: 'New path where the file or directory should be moved',
            },
            overwrite: {
              type: 'boolean',
              description: 'Whether to overwrite if destination exists',
              default: false,
            },
          },
          required: ['sourcePath', 'destinationPath'],
        },
      },
      {
        name: 'copy-file',
        description: 'Copy a file or directory in NextCloud',
        inputSchema: {
          type: 'object',
          properties: {
            sourcePath: {
              type: 'string',
              description: 'Path of the file or directory to copy',
            },
            destinationPath: {
              type: 'string',
              description: 'Destination path for the copy',
            },
            overwrite: {
              type: 'boolean',
              description: 'Whether to overwrite if destination exists',
              default: false,
            },
          },
          required: ['sourcePath', 'destinationPath'],
        },
      },
      {
        name: 'search-files',
        description: 'Search for files and directories by name or content',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query string',
            },
            path: {
              type: 'string',
              description: 'Directory path to search within (optional)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 50,
            },
            type: {
              type: 'string',
              enum: ['file', 'directory', 'all'],
              description: 'Type of items to search for',
              default: 'all',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get-file-versions',
        description: 'Get version history of a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path of the file to get versions for',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'restore-file-version',
        description: 'Restore a specific version of a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path of the file to restore',
            },
            versionId: {
              type: 'string',
              description: 'ID of the version to restore',
            },
          },
          required: ['path', 'versionId'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'test-connection': {
        const result = await nextcloud.testConnection();
        return {
          content: [
            {
              type: 'text',
              text: result.success ? result.data! : `Error: ${result.error}`,
            },
          ],
        };
      }

      case 'list-files': {
        const path = (args?.path as string) || '/';
        const result = await nextcloud.listFiles(path);
        
        if (result.success) {
          const fileList = result.data!
            .map(file => `${file.type === 'directory' ? '📁' : '📄'} ${file.name} (${file.type === 'directory' ? 'Directory' : `${file.size} bytes`}) - Modified: ${file.lastModified.toISOString()}`)
            .join('\n');
          
          return {
            content: [
              {
                type: 'text',
                text: `Files in ${path}:\n${fileList}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.error}`,
              },
            ],
          };
        }
      }

      case 'create-directory': {
        const path = args?.path as string;
        if (!path) {
          throw new Error('Path is required');
        }
        
        const result = await nextcloud.createDirectory(path);
        return {
          content: [
            {
              type: 'text',
              text: result.success ? result.data! : `Error: ${result.error}`,
            },
          ],
        };
      }

      case 'delete-file': {
        const path = args?.path as string;
        if (!path) {
          throw new Error('Path is required');
        }
        
        const result = await nextcloud.deleteFile(path);
        return {
          content: [
            {
              type: 'text',
              text: result.success ? result.data! : `Error: ${result.error}`,
            },
          ],
        };
      }

      case 'upload-file': {
        const remotePath = args?.remotePath as string;
        const content = args?.content as string;
        
        if (!remotePath || !content) {
          throw new Error('Remote path and content are required');
        }
        
        const buffer = Buffer.from(content, 'base64');
        const result = await nextcloud.uploadFile(remotePath, buffer);
        
        return {
          content: [
            {
              type: 'text',
              text: result.success ? result.data! : `Error: ${result.error}`,
            },
          ],
        };
      }

      case 'download-file': {
        const path = args?.path as string;
        if (!path) {
          throw new Error('Path is required');
        }
        
        const result = await nextcloud.downloadFile(path);
        
        if (result.success) {
          const base64Content = result.data!.toString('base64');
          return {
            content: [
              {
                type: 'text',
                text: `File downloaded successfully. Content (base64):\n${base64Content}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.error}`,
              },
            ],
          };
        }
      }

      case 'create-share': {
        const path = args?.path as string;
        if (!path) {
          throw new Error('Path is required');
        }
        
        const shareOptions = {
          path,
          shareType: (args?.shareType as number) || 3,
          shareWith: args?.shareWith as string,
          permissions: (args?.permissions as number) || 1,
          password: args?.password as string,
          expireDate: args?.expireDate as string,
          note: args?.note as string,
        };
        
        const result = await nextcloud.createShare(shareOptions);
        
        if (result.success) {
          const share = result.data!;
          return {
            content: [
              {
                type: 'text',
                text: `Share created successfully!\nShare ID: ${share.id}\nShare URL: ${share.url || 'N/A'}\nToken: ${share.token || 'N/A'}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.error}`,
              },
            ],
          };
        }
      }

      case 'list-shares': {
        const path = args?.path as string;
        const result = await nextcloud.listShares(path);
        
        if (result.success) {
          if (result.data!.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: 'No shares found.',
                },
              ],
            };
          }
          
          const shareList = result.data!
            .map(share => `Share ID: ${share.id}\nPath: ${share.path || 'N/A'}\nType: ${share.shareType}\nURL: ${share.url || 'N/A'}\nPermissions: ${share.permissions}\n`)
            .join('\n---\n');
          
          return {
            content: [
              {
                type: 'text',
                text: `Existing shares:\n${shareList}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.error}`,
              },
            ],
          };
        }
      }

      case 'delete-share': {
        const shareId = args?.shareId as string;
        if (!shareId) {
          throw new Error('Share ID is required');
        }
        
        const result = await nextcloud.deleteShare(shareId);
        return {
          content: [
            {
              type: 'text',
              text: result.success ? result.data! : `Error: ${result.error}`,
            },
          ],
        };
      }

      case 'move-file': {
        const sourcePath = args?.sourcePath as string;
        const destinationPath = args?.destinationPath as string;
        const overwrite = args?.overwrite as boolean;

        if (!sourcePath || !destinationPath) {
          throw new Error('Source path and destination path are required');
        }

        const result = await nextcloud.moveFile({
          sourcePath,
          destinationPath,
          overwrite
        });

        return {
          content: [
            {
              type: 'text',
              text: result.success ? result.data! : `Error: ${result.error}`,
            },
          ],
        };
      }

      case 'copy-file': {
        const sourcePath = args?.sourcePath as string;
        const destinationPath = args?.destinationPath as string;
        const overwrite = args?.overwrite as boolean;

        if (!sourcePath || !destinationPath) {
          throw new Error('Source path and destination path are required');
        }

        const result = await nextcloud.copyFile({
          sourcePath,
          destinationPath,
          overwrite
        });

        return {
          content: [
            {
              type: 'text',
              text: result.success ? result.data! : `Error: ${result.error}`,
            },
          ],
        };
      }

      case 'search-files': {
        const query = args?.query as string;
        const path = args?.path as string;
        const limit = args?.limit as number;
        const type = args?.type as 'file' | 'directory' | 'all';

        if (!query) {
          throw new Error('Search query is required');
        }

        const result = await nextcloud.searchFiles({
          query,
          path,
          limit,
          type
        });

        if (result.success && result.data) {
          const fileList = result.data
            .map(file => `${file.type === 'directory' ? '📁' : '📄'} ${file.name} (${file.path}) - ${file.size} bytes, modified: ${file.lastModified.toISOString()}`)
            .join('\n');

          return {
            content: [
              {
                type: 'text',
                text: `Search results for "${query}":\n${fileList || 'No files found'}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.error}`,
              },
            ],
          };
        }
      }

      case 'get-file-versions': {
        const path = args?.path as string;

        if (!path) {
          throw new Error('File path is required');
        }

        const result = await nextcloud.getFileVersions(path);

        if (result.success && result.data) {
          const versionList = result.data
            .map(version => `Version ${version.id}: ${version.timestamp.toISOString()} - ${version.size} bytes by ${version.user}${version.label ? ` (${version.label})` : ''}`)
            .join('\n');

          return {
            content: [
              {
                type: 'text',
                text: `File versions for "${path}":\n${versionList || 'No versions found'}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${result.error}`,
              },
            ],
          };
        }
      }

      case 'restore-file-version': {
        const path = args?.path as string;
        const versionId = args?.versionId as string;

        if (!path || !versionId) {
          throw new Error('File path and version ID are required');
        }

        const result = await nextcloud.restoreFileVersion(path, versionId);

        return {
          content: [
            {
              type: 'text',
              text: result.success ? result.data! : `Error: ${result.error}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NextCloud MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
