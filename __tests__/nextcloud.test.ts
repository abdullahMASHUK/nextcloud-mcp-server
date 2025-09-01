import { NextCloudService } from '../src/services/nextcloud';

// Create a mock axios instance first
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
} as any;

// Mock axios module with both default export and create method
jest.mock('axios', () => {
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockAxiosInstance)
    }
  };
});

describe('NextCloudService', () => {
  const mockConfig = {
    baseUrl: 'https://test.nextcloud.com',
    username: 'testuser',
    password: 'testpass'
  };

  let service: NextCloudService;

  beforeEach(() => {
    service = new NextCloudService(mockConfig);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(service).toBeInstanceOf(NextCloudService);
    });

    it('should set default webdav path if not provided', () => {
      const configWithoutPath = { ...mockConfig };
      const serviceInstance = new NextCloudService(configWithoutPath);
      expect(serviceInstance).toBeInstanceOf(NextCloudService);
    });
  });

  describe('listFiles', () => {
    it('should return mock files for testing', async () => {
      // Mock successful response
      const mockResponse = {
        status: 207,
        data: `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/remote.php/webdav/test.txt</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>test.txt</d:displayname>
        <d:getcontentlength>123</d:getcontentlength>
        <d:getcontenttype>text/plain</d:getcontenttype>
        <d:getlastmodified>Mon, 01 Sep 2025 12:00:00 GMT</d:getlastmodified>
        <d:resourcetype/>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>`
      };

      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);
      
      const result = await service.listFiles('/');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data?.length).toBeGreaterThan(0);
      expect(result.data?.[0]).toHaveProperty('name', 'test.txt');
    });

    it('should handle different paths', async () => {
      // Mock successful response for Documents path
      const mockResponse = {
        status: 207,
        data: `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
  <d:response>
    <d:href>/remote.php/webdav/Documents/</d:href>
    <d:propstat>
      <d:prop>
        <d:displayname>Documents</d:displayname>
        <d:getlastmodified>Mon, 01 Sep 2025 12:00:00 GMT</d:getlastmodified>
        <d:resourcetype><d:collection/></d:resourcetype>
      </d:prop>
      <d:status>HTTP/1.1 200 OK</d:status>
    </d:propstat>
  </d:response>
</d:multistatus>`
      };

      mockAxiosInstance.request.mockResolvedValueOnce(mockResponse);
      
      const result = await service.listFiles('/Documents');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
    });

    it('should handle errors gracefully', async () => {
      // Mock error response
      mockAxiosInstance.request.mockRejectedValueOnce(new Error('Network error'));
      
      const result = await service.listFiles('/');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Failed to list files');
    });
  });
});
