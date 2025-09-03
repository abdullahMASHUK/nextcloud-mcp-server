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

  describe('High Priority Tools', () => {
    describe('moveFile', () => {
      it('should move file successfully', async () => {
        mockAxiosInstance.request.mockResolvedValueOnce({
          status: 201
        });

        const result = await service.moveFile({
          sourcePath: '/old/file.txt',
          destinationPath: '/new/file.txt',
          overwrite: false
        });

        expect(result.success).toBe(true);
        expect(result.data).toContain('moved successfully');
        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'MOVE',
          url: '/remote.php/webdav/old/file.txt',
          headers: {
            'Destination': 'https://test.nextcloud.com/remote.php/webdav/new/file.txt'
          }
        });
      });

      it('should handle move errors', async () => {
        mockAxiosInstance.request.mockRejectedValueOnce(new Error('Permission denied'));

        const result = await service.moveFile({
          sourcePath: '/old/file.txt',
          destinationPath: '/new/file.txt'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Move file failed');
      });
    });

    describe('copyFile', () => {
      it('should copy file successfully', async () => {
        mockAxiosInstance.request.mockResolvedValueOnce({
          status: 201
        });

        const result = await service.copyFile({
          sourcePath: '/source/file.txt',
          destinationPath: '/copy/file.txt',
          overwrite: true
        });

        expect(result.success).toBe(true);
        expect(result.data).toContain('copied successfully');
        expect(mockAxiosInstance.request).toHaveBeenCalledWith({
          method: 'COPY',
          url: '/remote.php/webdav/source/file.txt',
          headers: {
            'Destination': 'https://test.nextcloud.com/remote.php/webdav/copy/file.txt',
            'Overwrite': 'T'
          }
        });
      });

      it('should handle copy errors', async () => {
        mockAxiosInstance.request.mockRejectedValueOnce(new Error('File not found'));

        const result = await service.copyFile({
          sourcePath: '/source/file.txt',
          destinationPath: '/copy/file.txt'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Copy file failed');
      });
    });

    describe('searchFiles', () => {
      it('should search files using OCS API successfully', async () => {
        const mockSearchResponse = {
          data: {
            ocs: {
              data: [
                {
                  name: 'document.pdf',
                  path: '/Documents/document.pdf',
                  size: 1024,
                  type: 'file',
                  mtime: 1609459200,
                  mimetype: 'application/pdf'
                }
              ]
            }
          }
        };

        mockAxiosInstance.get.mockResolvedValueOnce(mockSearchResponse);

        const result = await service.searchFiles({
          query: 'document',
          path: '/Documents',
          limit: 10,
          type: 'file'
        });

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data![0].name).toBe('document.pdf');
        expect(result.data![0].type).toBe('file');
      });

      it('should fallback to WebDAV search when OCS API fails', async () => {
        // Mock OCS API failure
        mockAxiosInstance.get.mockRejectedValueOnce(new Error('OCS API not available'));
        
        // Mock successful fallback WebDAV response
        const mockWebDAVResponse = {
          data: `<?xml version="1.0"?>
            <d:multistatus xmlns:d="DAV:">
              <d:response>
                <d:href>/remote.php/webdav/Documents/test.txt</d:href>
                <d:propstat>
                  <d:prop>
                    <d:displayname>test.txt</d:displayname>
                    <d:getcontentlength>100</d:getcontentlength>
                    <d:getlastmodified>Wed, 01 Jan 2021 00:00:00 GMT</d:getlastmodified>
                  </d:prop>
                </d:propstat>
              </d:response>
            </d:multistatus>`
        };

        mockAxiosInstance.request.mockResolvedValueOnce(mockWebDAVResponse);

        const result = await service.searchFiles({
          query: 'test',
          limit: 5
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeInstanceOf(Array);
      });
    });

    describe('getFileVersions', () => {
      it('should get file versions successfully', async () => {
        const mockVersionsResponse = {
          data: {
            ocs: {
              data: [
                {
                  id: 123,
                  timestamp: 1609459200,
                  size: 1024,
                  user: 'testuser',
                  label: 'Version 1'
                }
              ]
            }
          }
        };

        mockAxiosInstance.get.mockResolvedValueOnce(mockVersionsResponse);

        const result = await service.getFileVersions('/Documents/file.txt');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data![0].id).toBe('123');
        expect(result.data![0].user).toBe('testuser');
      });

      it('should handle no versions available', async () => {
        const mockEmptyResponse = {
          data: {
            ocs: {
              data: []
            }
          }
        };

        mockAxiosInstance.get.mockResolvedValueOnce(mockEmptyResponse);

        const result = await service.getFileVersions('/Documents/file.txt');

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(0);
      });
    });

    describe('restoreFileVersion', () => {
      it('should restore file version successfully', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce({
          status: 200
        });

        const result = await service.restoreFileVersion('/Documents/file.txt', '123');

        expect(result.success).toBe(true);
        expect(result.data).toContain('restored successfully');
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          `/ocs/v2.php/apps/files_versions/api/v1/versions/${encodeURIComponent('/Documents/file.txt')}/123`,
          {},
          {
            headers: {
              'OCS-APIRequest': 'true',
              'Accept': 'application/json'
            }
          }
        );
      });

      it('should handle restore errors', async () => {
        mockAxiosInstance.post.mockRejectedValueOnce(new Error('Version not found'));

        const result = await service.restoreFileVersion('/Documents/file.txt', '999');

        expect(result.success).toBe(false);
        expect(result.error).toContain('Restore file version failed');
      });
    });
  });
});
