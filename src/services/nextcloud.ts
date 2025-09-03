import axios, { AxiosInstance } from 'axios';
import * as xml2js from 'xml2js';
import FormData from 'form-data';
import {
  NextCloudConfig,
  FileInfo,
  ShareInfo,
  CreateShareOptions,
  ApiResponse,
  MoveFileOptions,
  CopyFileOptions,
  SearchOptions,
  FileVersion
} from '../types.js';

export class NextCloudService {
  private httpClient: AxiosInstance;
  private config: NextCloudConfig;
  private xmlParser: xml2js.Parser;

  constructor(config: NextCloudConfig) {
    this.config = {
      ...config,
      webdavPath: config.webdavPath || '/remote.php/webdav/'
    };

    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      auth: {
        username: this.config.username,
        password: this.config.password
      },
      timeout: 30000,
      headers: {
        'User-Agent': 'NextCloud-MCP-Server/1.0.0'
      }
    });

    this.xmlParser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true
    });
  }

  async testConnection(): Promise<ApiResponse<string>> {
    try {
      const response = await this.httpClient.get('/status.php');
      if (response.data && response.data.installed) {
        return {
          success: true,
          data: `Connected to NextCloud successfully. Version: ${response.data.version || 'Unknown'}`
        };
      } else {
        return {
          success: false,
          error: 'NextCloud instance not properly configured'
        };
      }
    } catch (error: any) {
      return this.handleError('Connection test failed', error);
    }
  }

  async listFiles(path: string = '/'): Promise<ApiResponse<FileInfo[]>> {
    try {
      const webdavUrl = `${this.config.webdavPath}${path.replace(/^\//, '')}`;
      
      const response = await this.httpClient.request({
        method: 'PROPFIND',
        url: webdavUrl,
        headers: {
          'Depth': '1',
          'Content-Type': 'application/xml'
        },
        data: `<?xml version="1.0"?>
          <d:propfind xmlns:d="DAV:">
            <d:prop>
              <d:displayname/>
              <d:getcontentlength/>
              <d:getcontenttype/>
              <d:getlastmodified/>
              <d:resourcetype/>
            </d:prop>
          </d:propfind>`
      });

      const result = await this.xmlParser.parseStringPromise(response.data);
      const files: FileInfo[] = [];

      if (result['d:multistatus'] && result['d:multistatus']['d:response']) {
        const responses = Array.isArray(result['d:multistatus']['d:response']) 
          ? result['d:multistatus']['d:response'] 
          : [result['d:multistatus']['d:response']];

        for (const item of responses) {
          if (item['d:href'] === webdavUrl || item['d:href'] === webdavUrl + '/') {
            continue; // Skip the current directory
          }

          const props = item['d:propstat']?.['d:prop'] || {};
          const href = item['d:href'] || '';
          const name = props['d:displayname'] || href.split('/').pop() || '';
          const isDirectory = props['d:resourcetype'] && props['d:resourcetype']['d:collection'] !== undefined;

          files.push({
            name,
            path: href.replace(this.config.webdavPath, '/'),
            size: isDirectory ? 0 : parseInt(props['d:getcontentlength'] || '0'),
            type: isDirectory ? 'directory' : 'file',
            lastModified: props['d:getlastmodified'] ? new Date(props['d:getlastmodified']) : new Date(),
            mimeType: props['d:getcontenttype']
          });
        }
      }

      return {
        success: true,
        data: files
      };
    } catch (error: any) {
      return this.handleError('Failed to list files', error);
    }
  }

  async createDirectory(path: string): Promise<ApiResponse<string>> {
    try {
      const webdavUrl = `${this.config.webdavPath}${path.replace(/^\//, '')}`;
      
      await this.httpClient.request({
        method: 'MKCOL',
        url: webdavUrl
      });

      return {
        success: true,
        data: `Directory created successfully: ${path}`
      };
    } catch (error: any) {
      return this.handleError('Failed to create directory', error);
    }
  }

  async deleteFile(path: string): Promise<ApiResponse<string>> {
    try {
      const webdavUrl = `${this.config.webdavPath}${path.replace(/^\//, '')}`;
      
      await this.httpClient.request({
        method: 'DELETE',
        url: webdavUrl
      });

      return {
        success: true,
        data: `File/directory deleted successfully: ${path}`
      };
    } catch (error: any) {
      return this.handleError('Failed to delete file', error);
    }
  }

  async uploadFile(remotePath: string, content: Buffer): Promise<ApiResponse<string>> {
    try {
      const webdavUrl = `${this.config.webdavPath}${remotePath.replace(/^\//, '')}`;
      
      await this.httpClient.request({
        method: 'PUT',
        url: webdavUrl,
        data: content,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });

      return {
        success: true,
        data: `File uploaded successfully: ${remotePath}`
      };
    } catch (error: any) {
      return this.handleError('Failed to upload file', error);
    }
  }

  async downloadFile(path: string): Promise<ApiResponse<Buffer>> {
    try {
      const webdavUrl = `${this.config.webdavPath}${path.replace(/^\//, '')}`;
      
      const response = await this.httpClient.request({
        method: 'GET',
        url: webdavUrl,
        responseType: 'arraybuffer'
      });

      return {
        success: true,
        data: Buffer.from(response.data)
      };
    } catch (error: any) {
      return this.handleError('Failed to download file', error);
    }
  }

  async createShare(options: CreateShareOptions): Promise<ApiResponse<ShareInfo>> {
    try {
      const formData = new FormData();
      formData.append('path', options.path);
      formData.append('shareType', options.shareType.toString());
      
      if (options.shareWith) formData.append('shareWith', options.shareWith);
      if (options.permissions) formData.append('permissions', options.permissions.toString());
      if (options.password) formData.append('password', options.password);
      if (options.expireDate) formData.append('expireDate', options.expireDate);
      if (options.note) formData.append('note', options.note);

      const response = await this.httpClient.post('/ocs/v2.php/apps/files_sharing/api/v1/shares', formData, {
        headers: {
          ...formData.getHeaders(),
          'OCS-APIRequest': 'true'
        }
      });

      if (response.data?.ocs?.data) {
        const shareData = response.data.ocs.data;
        return {
          success: true,
          data: {
            id: shareData.id?.toString() || '',
            shareType: shareData.share_type || options.shareType,
            shareWith: shareData.share_with,
            permissions: shareData.permissions || 1,
            token: shareData.token,
            url: shareData.url,
            expiration: shareData.expiration,
            note: shareData.note,
            path: shareData.path,
            displayName: shareData.displayname_file_owner
          }
        };
      } else {
        return {
          success: false,
          error: 'Invalid response from NextCloud sharing API'
        };
      }
    } catch (error: any) {
      return this.handleError('Failed to create share', error);
    }
  }

  async listShares(path?: string): Promise<ApiResponse<ShareInfo[]>> {
    try {
      let url = '/ocs/v2.php/apps/files_sharing/api/v1/shares';
      if (path) {
        url += `?path=${encodeURIComponent(path)}`;
      }

      const response = await this.httpClient.get(url, {
        headers: {
          'OCS-APIRequest': 'true'
        }
      });

      if (response.data?.ocs?.data) {
        const shares = Array.isArray(response.data.ocs.data) 
          ? response.data.ocs.data 
          : [response.data.ocs.data];

        const shareInfos: ShareInfo[] = shares.map((share: any) => ({
          id: share.id?.toString() || '',
          shareType: share.share_type || 0,
          shareWith: share.share_with,
          permissions: share.permissions || 1,
          token: share.token,
          url: share.url,
          expiration: share.expiration,
          note: share.note,
          path: share.path,
          displayName: share.displayname_file_owner
        }));

        return {
          success: true,
          data: shareInfos
        };
      } else {
        return {
          success: true,
          data: []
        };
      }
    } catch (error: any) {
      return this.handleError('Failed to list shares', error);
    }
  }

  async deleteShare(shareId: string): Promise<ApiResponse<string>> {
    try {
      await this.httpClient.delete(`/ocs/v2.php/apps/files_sharing/api/v1/shares/${shareId}`, {
        headers: {
          'OCS-APIRequest': 'true'
        }
      });

      return {
        success: true,
        data: `Share deleted successfully: ${shareId}`
      };
    } catch (error: any) {
      return this.handleError('Failed to delete share', error);
    }
  }

  private handleError(message: string, error: any): ApiResponse<never> {
    console.error(message, error);
    
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    return {
      success: false,
      error: `${message}: ${errorMessage}`
    };
  }

  // High Priority Tools Implementation

  async moveFile(options: MoveFileOptions): Promise<ApiResponse<string>> {
    try {
      const sourceUrl = `${this.config.webdavPath}${options.sourcePath.replace(/^\//, '')}`;
      const destinationUrl = `${this.config.baseUrl}${this.config.webdavPath}${options.destinationPath.replace(/^\//, '')}`;

      const headers: any = {
        'Destination': destinationUrl
      };

      if (options.overwrite) {
        headers['Overwrite'] = 'T';
      }

      const response = await this.httpClient.request({
        method: 'MOVE',
        url: sourceUrl,
        headers
      });

      if (response.status === 201 || response.status === 204) {
        return {
          success: true,
          data: `File moved successfully from ${options.sourcePath} to ${options.destinationPath}`
        };
      } else {
        return {
          success: false,
          error: `Move operation failed with status ${response.status}`
        };
      }
    } catch (error: any) {
      return this.handleError('Move file failed', error);
    }
  }

  async copyFile(options: CopyFileOptions): Promise<ApiResponse<string>> {
    try {
      const sourceUrl = `${this.config.webdavPath}${options.sourcePath.replace(/^\//, '')}`;
      const destinationUrl = `${this.config.baseUrl}${this.config.webdavPath}${options.destinationPath.replace(/^\//, '')}`;

      const headers: any = {
        'Destination': destinationUrl
      };

      if (options.overwrite) {
        headers['Overwrite'] = 'T';
      }

      const response = await this.httpClient.request({
        method: 'COPY',
        url: sourceUrl,
        headers
      });

      if (response.status === 201 || response.status === 204) {
        return {
          success: true,
          data: `File copied successfully from ${options.sourcePath} to ${options.destinationPath}`
        };
      } else {
        return {
          success: false,
          error: `Copy operation failed with status ${response.status}`
        };
      }
    } catch (error: any) {
      return this.handleError('Copy file failed', error);
    }
  }

  async searchFiles(options: SearchOptions): Promise<ApiResponse<FileInfo[]>> {
    try {
      // Use NextCloud's search API endpoint
      const searchPath = options.path ? options.path.replace(/^\//, '') : '';
      const params = new URLSearchParams({
        term: options.query,
        limit: (options.limit || 50).toString()
      });

      if (searchPath) {
        params.append('in', searchPath);
      }

      const response = await this.httpClient.get(`/ocs/v2.php/apps/files/api/v1/search/${searchPath}?${params.toString()}`, {
        headers: {
          'OCS-APIRequest': 'true',
          'Accept': 'application/json'
        }
      });

      if (response.data?.ocs?.data) {
        const searchResults = response.data.ocs.data;
        const files: FileInfo[] = searchResults.map((item: any) => ({
          name: item.name || item.basename,
          path: item.path,
          size: parseInt(item.size) || 0,
          type: item.type === 'folder' ? 'directory' : 'file',
          lastModified: new Date(item.mtime * 1000),
          mimeType: item.mimetype
        }));

        // Filter by type if specified
        const filteredFiles = options.type && options.type !== 'all' 
          ? files.filter(file => file.type === options.type)
          : files;

        return {
          success: true,
          data: filteredFiles
        };
      } else {
        return {
          success: true,
          data: []
        };
      }
    } catch (error: any) {
      // Fallback to WebDAV-based search if OCS API is not available
      return this.fallbackSearch(options);
    }
  }

  private async fallbackSearch(options: SearchOptions): Promise<ApiResponse<FileInfo[]>> {
    try {
      // Get all files and filter locally
      const allFiles = await this.listFiles(options.path || '/');
      
      if (!allFiles.success || !allFiles.data) {
        return allFiles;
      }

      const query = options.query.toLowerCase();
      const filteredFiles = allFiles.data.filter(file => {
        const matchesName = file.name.toLowerCase().includes(query);
        const matchesType = !options.type || options.type === 'all' || file.type === options.type;
        return matchesName && matchesType;
      });

      const limitedFiles = options.limit 
        ? filteredFiles.slice(0, options.limit)
        : filteredFiles;

      return {
        success: true,
        data: limitedFiles
      };
    } catch (error: any) {
      return this.handleError('Search files failed', error);
    }
  }

  async getFileVersions(path: string): Promise<ApiResponse<FileVersion[]>> {
    try {
      const response = await this.httpClient.get(`/ocs/v2.php/apps/files_versions/api/v1/versions/${encodeURIComponent(path)}`, {
        headers: {
          'OCS-APIRequest': 'true',
          'Accept': 'application/json'
        }
      });

      if (response.data?.ocs?.data) {
        const versions: FileVersion[] = response.data.ocs.data.map((version: any) => ({
          id: version.id.toString(),
          timestamp: new Date(version.timestamp * 1000),
          size: parseInt(version.size) || 0,
          user: version.user || 'unknown',
          label: version.label
        }));

        return {
          success: true,
          data: versions
        };
      } else {
        return {
          success: true,
          data: []
        };
      }
    } catch (error: any) {
      return this.handleError('Get file versions failed', error);
    }
  }

  async restoreFileVersion(path: string, versionId: string): Promise<ApiResponse<string>> {
    try {
      const response = await this.httpClient.post(
        `/ocs/v2.php/apps/files_versions/api/v1/versions/${encodeURIComponent(path)}/${versionId}`,
        {},
        {
          headers: {
            'OCS-APIRequest': 'true',
            'Accept': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        return {
          success: true,
          data: `File version ${versionId} restored successfully for ${path}`
        };
      } else {
        return {
          success: false,
          error: `Restore operation failed with status ${response.status}`
        };
      }
    } catch (error: any) {
      return this.handleError('Restore file version failed', error);
    }
  }
}
