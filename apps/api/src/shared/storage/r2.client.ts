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

export interface R2ClientConfig {
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName?: string;
  endpoint?: string;
}

export function getR2Config() {
  return {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'access-key-id',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'secret-access-key',
    bulkImportsBucket: process.env.R2_BULK_IMPORTS_BUCKET || 'perigee-products-bulk-upload',
    productMediaBucket: process.env.R2_PRODUCT_MEDIA_BUCKET || 'perigee-product-media',
    endpoint: process.env.R2_ENDPOINT || 'http://localhost:9000',
  };
}

export const R2_BULK_IMPORTS_BUCKET =
  process.env.R2_BULK_IMPORTS_BUCKET || 'perigee-products-bulk-upload';
export const R2_PRODUCT_MEDIA_BUCKET =
  process.env.R2_PRODUCT_MEDIA_BUCKET || 'perigee-product-media';

let cachedS3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!cachedS3Client) {
    const config = getR2Config();
    cachedS3Client = new S3Client({
      region: 'auto',
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

export const s3Client = {
  send: (cmd: unknown) =>
    (getS3Client() as unknown as { send: (c: unknown) => Promise<unknown> }).send(cmd),
} as unknown as S3Client;

/**
 * Cloudflare R2 / S3 storage wrapper supporting multiple buckets (bulk imports, product media, etc.).
 */
export class R2StorageService {
  private get client(): S3Client {
    return getS3Client();
  }

  private get defaultBucket(): string {
    return getR2Config().bulkImportsBucket;
  }

  /**
   * Generates a presigned URL allowing the browser to directly HTTP PUT a file to R2.
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
   * Returns a Node.js Readable stream of the specified S3 object.
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
   * Uploads an object directly to R2.
   */
  async putObject(
    key: string,
    body: string | Buffer | Uint8Array,
    contentType = 'text/csv',
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
   * Checks if an object exists in R2.
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
   * Deletes a single object from R2.
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
}

export const r2Service = new R2StorageService();
