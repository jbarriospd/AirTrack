// fs-polyfill.ts - File System Polyfill for Cloudflare Pages
// This polyfill provides basic fs operations using in-memory storage

interface FSStats {
  isFile(): boolean;
  isDirectory(): boolean;
  size: number;
  mtime: Date;
}

class FSError extends Error {
  code: string;
  
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'FSError';
  }
}

// In-memory storage for Cloudflare Pages
const memoryStorage = new Map<string, string>();

class FSPolyfill {
  // Read file as string
  async readFile(path: string, encoding?: string): Promise<string> {
    const content = memoryStorage.get(path);
    if (content === undefined) {
      throw new FSError('ENOENT', `no such file or directory, open '${path}'`);
    }
    return content;
  }

  // Write file
  async writeFile(path: string, data: string): Promise<void> {
    memoryStorage.set(path, data);
  }

  // Append to file
  async appendFile(path: string, data: string): Promise<void> {
    const existing = memoryStorage.get(path) || '';
    memoryStorage.set(path, existing + data);
  }

  // Check if file exists
  async exists(path: string): Promise<boolean> {
    return memoryStorage.has(path);
  }

  // Get file stats
  async stat(path: string): Promise<FSStats> {
    const content = memoryStorage.get(path);
    if (content === undefined) {
      throw new FSError('ENOENT', `no such file or directory, stat '${path}'`);
    }
    
    return {
      isFile: () => true,
      isDirectory: () => false,
      size: content.length,
      mtime: new Date()
    };
  }

  // Delete file
  async unlink(path: string): Promise<void> {
    if (!memoryStorage.has(path)) {
      throw new FSError('ENOENT', `no such file or directory, unlink '${path}'`);
    }
    memoryStorage.delete(path);
  }

  // List directory (simulate with prefix)
  async readdir(path: string): Promise<string[]> {
    const prefix = path.endsWith('/') ? path : path + '/';
    const keys = Array.from(memoryStorage.keys());
    
    // Extract just the filenames (remove prefix and path separators)
    return keys
      .filter(key => key.startsWith(prefix))
      .map(key => key.replace(prefix, ''))
      .filter(name => name && !name.includes('/'))
      .map(name => name.split('/')[0])
      .filter((name, index, arr) => arr.indexOf(name) === index);
  }

  // Create directory (no-op in memory storage)
  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    // Memory storage doesn't have directories, so this is a no-op
    // We could store a marker if needed
    memoryStorage.set(path + '/.directory', '');
  }

  // Remove directory
  async rmdir(path: string): Promise<void> {
    const prefix = path.endsWith('/') ? path : path + '/';
    const keys = Array.from(memoryStorage.keys());
    
    // Delete all files with this prefix
    keys.filter(key => key.startsWith(prefix)).forEach(key => {
      memoryStorage.delete(key);
    });
  }
}

// Create singleton instance
const fsPolyfill = new FSPolyfill();

// Export fs-like interface
export const fs = {
  readFile: (path: string, encoding?: string) => fsPolyfill.readFile(path, encoding),
  writeFile: (path: string, data: string) => fsPolyfill.writeFile(path, data),
  appendFile: (path: string, data: string) => fsPolyfill.appendFile(path, data),
  exists: (path: string) => fsPolyfill.exists(path),
  stat: (path: string) => fsPolyfill.stat(path),
  unlink: (path: string) => fsPolyfill.unlink(path),
  readdir: (path: string) => fsPolyfill.readdir(path),
  mkdir: (path: string, options?: { recursive?: boolean }) => fsPolyfill.mkdir(path, options),
  rmdir: (path: string) => fsPolyfill.rmdir(path),
};

// Export promises version (similar to fs/promises)
export const promises = fs;

// Export for default import
export default fs;

// Types
export { FSStats, FSError };
