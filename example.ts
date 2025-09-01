#!/usr/bin/env node

/**
 * Example usage of NextCloud MCP Server
 * 
 * This example demonstrates how to use the NextCloud MCP Server
 * for various file operations and sharing.
 */

import { NextCloudService } from './src/services/nextcloud.js';
import { NextCloudConfig } from './src/types.js';

// Configuration - replace with your actual NextCloud details
const config: NextCloudConfig = {
  baseUrl: process.env.NEXTCLOUD_URL || 'https://your-nextcloud-server.com',
  username: process.env.NEXTCLOUD_USERNAME || 'your-username',
  password: process.env.NEXTCLOUD_PASSWORD || 'your-password'
};

async function runExample(): Promise<void> {
  console.log('🚀 NextCloud MCP Server Example\n');

  // Initialize the service
  const nextcloud = new NextCloudService(config);

  try {
    // 1. Test connection
    console.log('1. Testing connection...');
    const connectionResult = await nextcloud.testConnection();
    if (connectionResult.success) {
      console.log('✅', connectionResult.data);
    } else {
      console.log('❌', connectionResult.error);
      return;
    }

    // 2. List files in root directory
    console.log('\n2. Listing files in root directory...');
    const filesResult = await nextcloud.listFiles('/');
    if (filesResult.success) {
      console.log('✅ Found', filesResult.data!.length, 'items:');
      filesResult.data!.forEach(file => {
        const icon = file.type === 'directory' ? '📁' : '📄';
        console.log(`   ${icon} ${file.name} (${file.type === 'directory' ? 'Directory' : `${file.size} bytes`})`);
      });
    } else {
      console.log('❌', filesResult.error);
    }

    // 3. Create a test directory
    console.log('\n3. Creating test directory...');
    const testDirPath = '/MCP-Server-Test';
    const createDirResult = await nextcloud.createDirectory(testDirPath);
    if (createDirResult.success) {
      console.log('✅', createDirResult.data);
    } else {
      console.log('❌', createDirResult.error);
    }

    // 4. Upload a test file
    console.log('\n4. Uploading test file...');
    const testContent = Buffer.from('Hello from NextCloud MCP Server!\nThis is a test file created by the example script.', 'utf8');
    const uploadResult = await nextcloud.uploadFile(`${testDirPath}/test-file.txt`, testContent);
    if (uploadResult.success) {
      console.log('✅', uploadResult.data);
    } else {
      console.log('❌', uploadResult.error);
    }

    // 5. List files in the test directory
    console.log('\n5. Listing files in test directory...');
    const testDirFiles = await nextcloud.listFiles(testDirPath);
    if (testDirFiles.success) {
      console.log('✅ Found', testDirFiles.data!.length, 'items in test directory:');
      testDirFiles.data!.forEach(file => {
        const icon = file.type === 'directory' ? '📁' : '📄';
        console.log(`   ${icon} ${file.name} (${file.size} bytes)`);
      });
    } else {
      console.log('❌', testDirFiles.error);
    }

    // 6. Create a public share for the test file
    console.log('\n6. Creating public share...');
    const shareResult = await nextcloud.createShare({
      path: `${testDirPath}/test-file.txt`,
      shareType: 3, // Public link
      permissions: 1, // Read only
      note: 'Test file created by MCP Server example'
    });
    if (shareResult.success) {
      console.log('✅ Share created successfully!');
      console.log('   Share ID:', shareResult.data!.id);
      console.log('   Share URL:', shareResult.data!.url || 'N/A');
      console.log('   Token:', shareResult.data!.token || 'N/A');
    } else {
      console.log('❌', shareResult.error);
    }

    // 7. List all shares
    console.log('\n7. Listing all shares...');
    const sharesResult = await nextcloud.listShares();
    if (sharesResult.success) {
      if (sharesResult.data!.length > 0) {
        console.log('✅ Found', sharesResult.data!.length, 'shares:');
        sharesResult.data!.forEach(share => {
          console.log(`   📤 Share ID: ${share.id}, Path: ${share.path || 'N/A'}, Type: ${share.shareType}`);
        });
      } else {
        console.log('✅ No shares found.');
      }
    } else {
      console.log('❌', sharesResult.error);
    }

    // 8. Download the test file
    console.log('\n8. Downloading test file...');
    const downloadResult = await nextcloud.downloadFile(`${testDirPath}/test-file.txt`);
    if (downloadResult.success) {
      const content = downloadResult.data!.toString('utf8');
      console.log('✅ File downloaded successfully!');
      console.log('   Content preview:', content.substring(0, 50) + '...');
    } else {
      console.log('❌', downloadResult.error);
    }

    console.log('\n🎉 Example completed successfully!');
    console.log('\n📝 Note: You can clean up the test files manually from your NextCloud interface.');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  runExample().catch(console.error);
}

export { runExample };
