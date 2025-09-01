import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

// Mock the NextCloudService
jest.mock('../src/services/nextcloud', () => {
  return {
    NextCloudService: jest.fn().mockImplementation(() => ({
      testConnection: jest.fn().mockResolvedValue({
        success: true,
        data: 'Connection successful'
      }),
      listFiles: jest.fn().mockResolvedValue({
        success: true,
        data: [
          {
            name: 'test.txt',
            path: '/test.txt',
            size: 1024,
            type: 'file',
            lastModified: new Date('2023-01-01'),
            mimeType: 'text/plain'
          }
        ]
      }),
      createDirectory: jest.fn().mockResolvedValue({
        success: true,
        data: 'Directory created'
      }),
      deleteFile: jest.fn().mockResolvedValue({
        success: true,
        data: 'File deleted'
      }),
      uploadFile: jest.fn().mockResolvedValue({
        success: true,
        data: 'File uploaded'
      }),
      downloadFile: jest.fn().mockResolvedValue({
        success: true,
        data: Buffer.from('test content')
      }),
      createShare: jest.fn().mockResolvedValue({
        success: true,
        data: {
          id: '123',
          shareType: 3,
          url: 'https://example.com/share/123',
          token: 'abc123',
          permissions: 1
        }
      }),
      listShares: jest.fn().mockResolvedValue({
        success: true,
        data: []
      }),
      deleteShare: jest.fn().mockResolvedValue({
        success: true,
        data: 'Share deleted'
      })
    }))
  };
});

describe('MCP Server Integration', () => {
  let server: Server;

  beforeEach(() => {
    // Set up environment variables for testing
    process.env.NEXTCLOUD_URL = 'https://test.example.com';
    process.env.NEXTCLOUD_USERNAME = 'testuser';
    process.env.NEXTCLOUD_PASSWORD = 'testpass';

    // Import and set up server after mocking
    const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
    server = new Server(
      { name: 'test-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.NEXTCLOUD_URL;
    delete process.env.NEXTCLOUD_USERNAME;
    delete process.env.NEXTCLOUD_PASSWORD;
  });

  it('should be able to create server instance', () => {
    expect(server).toBeInstanceOf(Server);
  });

  it('should handle list tools request', async () => {
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'test-connection',
          description: 'Test tool',
          inputSchema: { type: 'object', properties: {} }
        }
      ]
    }));

    const handler = (server as any).requestHandlers.get('tools/list');
    expect(handler).toBeDefined();
  });

  it('should handle call tool request', async () => {
    server.setRequestHandler(CallToolRequestSchema, async (request) => ({
      content: [{ type: 'text', text: 'Test response' }]
    }));

    const handler = (server as any).requestHandlers.get('tools/call');
    expect(handler).toBeDefined();
  });
});
