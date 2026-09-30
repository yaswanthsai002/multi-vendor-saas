import { mkdir, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ponytail: locate project root storage/media directory simply without heavy cloud SDKs
const DEFAULT_STORAGE_ROOT = resolve(__dirname, '../../../../../storage/media');
const STORAGE_ROOT = process.env.STORAGE_DIR
  ? resolve(process.env.STORAGE_DIR)
  : DEFAULT_STORAGE_ROOT;

export interface StorageService {
  save(key: string, data: Buffer | Uint8Array): Promise<void>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  deleteDirectory(keyPrefix: string): Promise<void>;
  resolveUrl(key: string): string;
  getAbsolutePath(key: string): string;
  getStorageRoot(): string;
}

// minimal filesystem-based storage implementation
export class LocalFilesystemStorageService implements StorageService {
  private readonly rootDir: string;
  private readonly baseUrl: string;

  constructor(
    rootDir = STORAGE_ROOT,
    baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:4000',
  ) {
    this.rootDir = rootDir;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  getStorageRoot(): string {
    return this.rootDir;
  }

  getAbsolutePath(key: string): string {
    const cleanKey = normalize(key).replace(/^(\.\.(\/|\\|$))+/, '');
    return join(this.rootDir, cleanKey);
  }

  async save(key: string, data: Buffer | Uint8Array): Promise<void> {
    const filePath = this.getAbsolutePath(key);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
  }

  async read(key: string): Promise<Buffer> {
    const filePath = this.getAbsolutePath(key);
    return readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = this.getAbsolutePath(key);
      await unlink(filePath);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
  }

  async deleteDirectory(keyPrefix: string): Promise<void> {
    try {
      const dirPath = this.getAbsolutePath(keyPrefix);
      await rm(dirPath, { recursive: true, force: true });
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err;
      }
    }
  }

  resolveUrl(key: string): string {
    const normalizedKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${this.baseUrl}/media/${normalizedKey}`;
  }
}

export const storageService = new LocalFilesystemStorageService();
