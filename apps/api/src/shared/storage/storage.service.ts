import '../config/env.js';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { Readable } from 'node:stream';

export interface StorageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  region: string;
  bulkImportsBucket: string;
  productMediaBucket: string;
  publicUrl?: string;
}

export function getStorageConfig(): StorageConfig {
  return {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || 'access-key-id',
    secretAccessKey:
      process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || 'secret-access-key',
    endpoint: process.env.R2_ENDPOINT || process.env.AWS_ENDPOINT || 'http://localhost:9000',
    region: process.env.AWS_REGION || 'auto',
    bulkImportsBucket:
      process.env.R2_BULK_IMPORTS_BUCKET ||
      process.env.STORAGE_BULK_IMPORTS_BUCKET ||
      'perigee-products-bulk-upload',
    productMediaBucket:
      process.env.R2_PRODUCT_MEDIA_BUCKET ||
      process.env.STORAGE_PRODUCT_MEDIA_BUCKET ||
      'perigee-product-media',
    publicUrl: process.env.R2_PUBLIC_URL || process.env.STORAGE_PUBLIC_URL,
  };
}

export const STORAGE_BUCKETS = {
  get bulkImports() {
    return getStorageConfig().bulkImportsBucket;
  },
  get productMedia() {
    return getStorageConfig().productMediaBucket;
  },
};

let cachedS3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!cachedS3Client) {
    const config = getStorageConfig();
    cachedS3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  return cachedS3Client;
}

/**
 * ponytail: Universal S3-compatible storage service for Cloudflare R2, AWS S3, MinIO, or GCP.
 */
export class StorageService {
  private get client(): S3Client {
    return getS3Client();
  }

  private get defaultBucket(): string {
    return getStorageConfig().bulkImportsBucket;
  }

  /**
   * Generates a presigned URL allowing the client to directly HTTP PUT a file.
   */
  async generatePresignedPutUrl(
    key: string,
    contentType?: string,
    expiresIn = 900,
    bucket = this.defaultBucket,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ...(contentType ? { ContentType: contentType } : {}),
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Generates a presigned GET URL for downloading files.
   */
  async generatePresignedGetUrl(
    key: string,
    expiresIn = 3600,
    bucket = this.defaultBucket,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  /**
   * Returns a Node.js Readable stream of the specified storage object.
   */
  async getObjectStream(key: string, bucket = this.defaultBucket): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await this.client.send(command);
    if (!response.Body) {
      throw new Error(`Object body is empty for key: ${key}`);
    }
    return response.Body as Readable;
  }

  /**
   * Uploads an object directly to storage.
   */
  async putObject(
    key: string,
    body: string | Buffer | Uint8Array,
    contentType = 'application/octet-stream',
    bucket = this.defaultBucket,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await this.client.send(command);
  }

  /**
   * Checks if an object exists in storage.
   */
  async headObject(
    key: string,
    bucket = this.defaultBucket,
  ): Promise<{ contentLength?: number; contentType?: string } | null> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      const res = await this.client.send(command);
      return {
        contentLength: res.ContentLength,
        contentType: res.ContentType,
      };
    } catch {
      return null;
    }
  }

  /**
   * Deletes a single object from storage.
   */
  async deleteObject(key: string, bucket = this.defaultBucket): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await this.client.send(command);
    } catch {
      // Non-fatal
    }
  }

  /**
   * Deletes all objects under a prefix.
   */
  async deletePrefix(prefix: string, bucket = this.defaultBucket): Promise<void> {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      });
      const listedObjects = await this.client.send(listCommand);

      if (!listedObjects.Contents || listedObjects.Contents.length === 0) return;

      const deleteCommand = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: listedObjects.Contents.map(({ Key }) => ({ Key: Key! })),
        },
      });

      await this.client.send(deleteCommand);
    } catch {
      // Non-fatal
    }
  }

  /**
   * Resolves a public / endpoint URL for a given object key in storage.
   */
  resolveUrl(key: string, bucket = this.defaultBucket): string {
    const cleanKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
    const config = getStorageConfig();
    if (config.publicUrl) {
      return `${config.publicUrl.replace(/\/+$/, '')}/${cleanKey}`;
    }
    return `${config.endpoint.replace(/\/+$/, '')}/${bucket}/${cleanKey}`;
  }
}

export const storageService = new StorageService();
