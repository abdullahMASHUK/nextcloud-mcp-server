export interface NextCloudConfig {
  baseUrl: string;
  username: string;
  password: string;
  webdavPath?: string;
}

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'directory';
  lastModified: Date;
  mimeType?: string;
}

export interface ShareInfo {
  id: string;
  shareType: number;
  shareWith?: string;
  permissions: number;
  token?: string;
  url?: string;
  expiration?: string;
  note?: string;
  path?: string;
  displayName?: string;
}

export interface CreateShareOptions {
  path: string;
  shareType: number;
  shareWith?: string;
  permissions?: number;
  password?: string;
  expireDate?: string;
  note?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WebDAVResponse {
  href: string;
  propstat: {
    prop: {
      displayname?: string;
      getcontentlength?: string;
      getcontenttype?: string;
      getlastmodified?: string;
      resourcetype?: any;
    };
    status: string;
  }[];
}

export interface ShareOptions {
  shareType: 'public' | 'user' | 'group';
  shareWith?: string;
  password?: string;
  permissions?: number;
  expiration?: string;
  note?: string;
}

export interface UploadOptions {
  overwrite?: boolean;
  createDirectories?: boolean;
}

export interface NextCloudError extends Error {
  statusCode?: number;
  response?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// WebDAV response types
export interface WebDavFileEntry {
  href: string;
  propstat: {
    prop: {
      displayname?: string;
      getcontentlength?: string;
      getcontenttype?: string;
      getlastmodified?: string;
      resourcetype?: {
        collection?: any;
      };
      getetag?: string;
    };
    status: string;
  };
}

// OCS API response types
export interface OcsResponse<T = any> {
  ocs: {
    meta: {
      status: string;
      statuscode: number;
      message: string;
      totalitems?: string;
      itemsperpage?: string;
    };
    data: T;
  };
}

export interface OcsShareData {
  id: string;
  share_type: number;
  uid_owner: string;
  displayname_owner: string;
  permissions: number;
  stime: number;
  parent?: string;
  expiration?: string;
  token?: string;
  uid_file_owner: string;
  note?: string;
  label?: string;
  displayname_file_owner: string;
  path: string;
  item_type: string;
  mimetype: string;
  storage_id: string;
  storage: number;
  item_source: string;
  file_source: string;
  file_parent: string;
  file_target: string;
  share_with?: string;
  share_with_displayname?: string;
  password?: string;
  send_password_by_talk?: boolean;
  url?: string;
  mail_send?: number;
  hide_download?: number;
}

// File operation interfaces
export interface MoveFileOptions {
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
}

export interface CopyFileOptions {
  sourcePath: string;
  destinationPath: string;
  overwrite?: boolean;
}

export interface SearchOptions {
  query: string;
  path?: string;
  limit?: number;
  type?: 'file' | 'directory' | 'all';
}

export interface FileVersion {
  id: string;
  timestamp: Date;
  size: number;
  user: string;
  label?: string;
}

export interface TagInfo {
  id: string;
  name: string;
  userVisible: boolean;
  userAssignable: boolean;
  canAssign: boolean;
}
