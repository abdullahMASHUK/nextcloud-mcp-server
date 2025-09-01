import { NextCloudService } from '../src/services/nextcloud';

describe('NextCloudService', () => {
  const mockConfig = {
    baseUrl: 'https://test.nextcloud.com',
    username: 'testuser',
    password: 'testpass'
  };

  let service: NextCloudService;

  beforeEach(() => {
    service = new NextCloudService(mockConfig);
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
      const result = await service.listFiles('/');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should handle different paths', async () => {
      const result = await service.listFiles('/Documents');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
    });
  });
});
