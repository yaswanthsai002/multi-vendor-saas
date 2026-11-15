export const mediaTags = [
  {
    name: 'Vendor Media',
    description: 'Vendor media library management endpoints',
  },
  {
    name: 'Admin Media',
    description: 'Admin media catalog management',
  },
];

export const mediaSchemas = {
  MediaItem: {
    type: 'object',
    required: [
      'mediaId',
      'type',
      'originalFileName',
      'mimeType',
      'fileSizeBytes',
      'width',
      'height',
      'status',
      'original',
      'createdAt',
      'updatedAt',
      'disabledAt',
    ],
    properties: {
      mediaId: {
        type: 'string',
        format: 'uuid',
      },
      type: {
        type: 'string',
        enum: ['image', 'video'],
      },
      originalFileName: {
        type: 'string',
      },
      mimeType: {
        type: 'string',
      },
      fileSizeBytes: {
        type: 'integer',
      },
      width: {
        type: ['integer', 'null'],
      },
      height: {
        type: ['integer', 'null'],
      },
      durationSeconds: {
        type: ['number', 'null'],
      },
      status: {
        type: 'string',
        enum: ['active', 'disabled'],
      },
      original: {
        type: 'string',
        format: 'uri',
      },
      variants: {
        type: 'object',
        required: ['thumbnail', 'medium', 'large'],
        properties: {
          thumbnail: {
            type: 'string',
            format: 'uri',
          },
          medium: {
            type: 'string',
            format: 'uri',
          },
          large: {
            type: 'string',
            format: 'uri',
          },
        },
      },
      poster: {
        type: 'string',
        format: 'uri',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
      disabledAt: {
        type: ['string', 'null'],
        format: 'date-time',
      },
    },
  },
  MediaListResponse: {
    type: 'object',
    required: ['items', 'pagination'],
    properties: {
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/MediaItem',
        },
      },
      pagination: {
        type: 'object',
        required: ['page', 'limit', 'total', 'totalPages'],
        properties: {
          page: {
            type: 'integer',
          },
          limit: {
            type: 'integer',
          },
          total: {
            type: 'integer',
          },
          totalPages: {
            type: 'integer',
          },
        },
      },
      counts: {
        type: 'object',
        properties: {
          all: {
            type: 'integer',
          },
          image: {
            type: 'integer',
          },
          video: {
            type: 'integer',
          },
          disabled: {
            type: 'integer',
          },
        },
      },
    },
  },
  MediaUploadResponse: {
    type: 'object',
    required: ['message', 'media', 'items'],
    properties: {
      message: {
        type: 'string',
      },
      media: {
        $ref: '#/components/schemas/MediaItem',
      },
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/MediaItem',
        },
      },
    },
  },
  InitiateMediaUploadResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        const: true,
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            mediaId: {
              type: 'string',
              format: 'uuid',
            },
            uploadUrl: {
              type: 'string',
            },
            originalStorageKey: {
              type: 'string',
            },
            fileName: {
              type: 'string',
            },
            fileSizeBytes: {
              type: 'number',
            },
            mimeType: {
              type: 'string',
            },
          },
          required: [
            'mediaId',
            'uploadUrl',
            'originalStorageKey',
            'fileName',
            'fileSizeBytes',
            'mimeType',
          ],
        },
      },
    },
    required: ['success', 'items'],
  },
  CompleteMediaUploadResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
      media: {
        type: 'object',
        properties: {
          mediaId: {
            type: 'string',
            format: 'uuid',
          },
          type: {
            type: 'string',
            enum: ['image', 'video'],
          },
          originalFileName: {
            type: 'string',
          },
          mimeType: {
            type: 'string',
          },
          fileSizeBytes: {
            type: 'number',
          },
          width: {
            type: ['null', 'number'],
          },
          height: {
            type: ['null', 'number'],
          },
          durationSeconds: {
            type: ['null', 'number'],
          },
          status: {
            type: 'string',
            enum: ['active', 'disabled'],
          },
          original: {
            type: 'string',
          },
          variants: {
            anyOf: [
              {
                type: 'object',
                properties: {
                  thumbnail: {
                    type: 'string',
                  },
                  medium: {
                    type: 'string',
                  },
                  large: {
                    type: 'string',
                  },
                },
                required: ['thumbnail', 'medium', 'large'],
              },
            ],
          },
          poster: {
            type: ['string'],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          disabledAt: {
            anyOf: [
              {
                type: 'null',
              },
              {
                type: 'string',
                format: 'date-time',
              },
            ],
          },
        },
        required: [
          'mediaId',
          'type',
          'originalFileName',
          'mimeType',
          'fileSizeBytes',
          'width',
          'height',
          'status',
          'original',
          'createdAt',
          'updatedAt',
          'disabledAt',
        ],
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            mediaId: {
              type: 'string',
              format: 'uuid',
            },
            type: {
              type: 'string',
              enum: ['image', 'video'],
            },
            originalFileName: {
              type: 'string',
            },
            mimeType: {
              type: 'string',
            },
            fileSizeBytes: {
              type: 'number',
            },
            width: {
              type: ['null', 'number'],
            },
            height: {
              type: ['null', 'number'],
            },
            durationSeconds: {
              type: ['null', 'number'],
            },
            status: {
              type: 'string',
              enum: ['active', 'disabled'],
            },
            original: {
              type: 'string',
            },
            variants: {
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    thumbnail: {
                      type: 'string',
                    },
                    medium: {
                      type: 'string',
                    },
                    large: {
                      type: 'string',
                    },
                  },
                  required: ['thumbnail', 'medium', 'large'],
                },
              ],
            },
            poster: {
              type: ['string'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            disabledAt: {
              anyOf: [
                {
                  type: 'null',
                },
                {
                  type: 'string',
                  format: 'date-time',
                },
              ],
            },
          },
          required: [
            'mediaId',
            'type',
            'originalFileName',
            'mimeType',
            'fileSizeBytes',
            'width',
            'height',
            'status',
            'original',
            'createdAt',
            'updatedAt',
            'disabledAt',
          ],
        },
      },
    },
    required: ['message', 'media', 'items'],
  },
  BulkMediaActionResponse: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['delete', 'enable', 'disable'],
      },
      total: {
        type: 'number',
      },
      processed: {
        type: 'number',
      },
      failedCount: {
        type: 'number',
      },
      failed: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            mediaId: {
              type: 'string',
              format: 'uuid',
            },
            reason: {
              type: 'string',
            },
          },
          required: ['mediaId', 'reason'],
        },
      },
      message: {
        type: 'string',
      },
    },
    required: ['action', 'total', 'processed', 'failedCount', 'failed', 'message'],
  },
  AdminMediaCatalogResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            mediaId: {
              type: 'string',
              format: 'uuid',
            },
            type: {
              type: 'string',
              enum: ['image', 'video'],
            },
            originalFileName: {
              type: 'string',
            },
            mimeType: {
              type: 'string',
            },
            fileSizeBytes: {
              type: 'number',
            },
            width: {
              type: ['null', 'number'],
            },
            height: {
              type: ['null', 'number'],
            },
            durationSeconds: {
              type: ['null', 'number'],
            },
            status: {
              type: 'string',
              enum: ['active', 'disabled'],
            },
            original: {
              type: 'string',
            },
            variants: {
              anyOf: [
                {
                  type: 'object',
                  properties: {
                    thumbnail: {
                      type: 'string',
                    },
                    medium: {
                      type: 'string',
                    },
                    large: {
                      type: 'string',
                    },
                  },
                  required: ['thumbnail', 'medium', 'large'],
                },
              ],
            },
            poster: {
              type: ['string'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            disabledAt: {
              anyOf: [
                {
                  type: 'null',
                },
                {
                  type: 'string',
                  format: 'date-time',
                },
              ],
            },
          },
          required: [
            'mediaId',
            'type',
            'originalFileName',
            'mimeType',
            'fileSizeBytes',
            'width',
            'height',
            'status',
            'original',
            'createdAt',
            'updatedAt',
            'disabledAt',
          ],
        },
      },
      pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
          },
          limit: {
            type: 'number',
          },
          total: {
            type: 'number',
          },
          totalPages: {
            type: 'number',
          },
        },
        required: ['page', 'limit', 'total', 'totalPages'],
      },
    },
    required: ['items', 'pagination'],
  },
};

export const mediaPaths = {
  '/api/vendor/media/initiate': {
    post: {
      tags: ['Vendor Media'],
      summary: 'Initiate direct-to-storage media upload with metadata only',
      description:
        'Validates media metadata (filename, size, MIME) and generates presigned storage PUT URLs for client direct-to-storage upload.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                files: {
                  minItems: 1,
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      fileName: {
                        type: 'string',
                        minLength: 1,
                      },
                      fileSizeBytes: {
                        type: 'integer',
                        exclusiveMinimum: 0,
                        maximum: 9007199254740991,
                      },
                      mimeType: {
                        type: 'string',
                        minLength: 1,
                      },
                    },
                    required: ['fileName', 'fileSizeBytes', 'mimeType'],
                  },
                },
              },
              required: ['files'],
            },
            example: {
              files: [
                {
                  fileName: 'Example',
                  fileSizeBytes: 1,
                  mimeType: 'image/png',
                },
              ],
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/InitiateMediaUploadResponse',
              },
              example: {
                success: true,
                items: [
                  {
                    mediaId: '11111111-1111-4111-8111-111111111111',
                    uploadUrl: 'https://example.com/asset.webp',
                    originalStorageKey: 'Example',
                    fileName: 'Example',
                    fileSizeBytes: 1,
                    mimeType: 'image/png',
                  },
                ],
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/Error400',
        },
        '401': {
          $ref: '#/components/responses/Error401',
        },
        '403': {
          $ref: '#/components/responses/Error403',
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/vendor/media/complete': {
    post: {
      tags: ['Vendor Media'],
      summary: 'Complete direct-to-storage media upload with metadata only',
      description:
        'Confirms upload completion, verifies object in storage, processes WebP/poster variants, and inserts MediaLibrary records.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                items: {
                  minItems: 1,
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      mediaId: {
                        type: 'string',
                        format: 'uuid',
                        pattern:
                          '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
                      },
                      originalStorageKey: {
                        type: 'string',
                        minLength: 1,
                      },
                      fileName: {
                        type: 'string',
                        minLength: 1,
                      },
                      fileSizeBytes: {
                        type: 'integer',
                        exclusiveMinimum: 0,
                        maximum: 9007199254740991,
                      },
                      mimeType: {
                        type: 'string',
                        minLength: 1,
                      },
                    },
                    required: [
                      'mediaId',
                      'originalStorageKey',
                      'fileName',
                      'fileSizeBytes',
                      'mimeType',
                    ],
                  },
                },
              },
              required: ['items'],
            },
            example: {
              items: [
                {
                  mediaId: '11111111-1111-4111-8111-111111111111',
                  originalStorageKey: 'Example',
                  fileName: 'Example',
                  fileSizeBytes: 1,
                  mimeType: 'image/png',
                },
              ],
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CompleteMediaUploadResponse',
              },
              example: {
                message: 'Example',
                media: {
                  mediaId: '11111111-1111-4111-8111-111111111111',
                  type: 'image',
                  originalFileName: 'Example',
                  mimeType: 'image/png',
                  fileSizeBytes: 1,
                  width: 1,
                  height: 1,
                  durationSeconds: 1,
                  status: 'active',
                  original: 'Example',
                  variants: {
                    thumbnail: 'Example',
                    medium: 'Example',
                    large: 'Example',
                  },
                  poster: 'Example',
                  createdAt: '2026-11-15T10:00:00.000Z',
                  updatedAt: '2026-11-15T10:00:00.000Z',
                  disabledAt: '2026-11-15T10:00:00.000Z',
                },
                items: [
                  {
                    mediaId: '11111111-1111-4111-8111-111111111111',
                    type: 'image',
                    originalFileName: 'Example',
                    mimeType: 'image/png',
                    fileSizeBytes: 1,
                    width: 1,
                    height: 1,
                    durationSeconds: 1,
                    status: 'active',
                    original: 'Example',
                    variants: {
                      thumbnail: 'Example',
                      medium: 'Example',
                      large: 'Example',
                    },
                    poster: 'Example',
                    createdAt: '2026-11-15T10:00:00.000Z',
                    updatedAt: '2026-11-15T10:00:00.000Z',
                    disabledAt: '2026-11-15T10:00:00.000Z',
                  },
                ],
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/Error400',
        },
        '401': {
          $ref: '#/components/responses/Error401',
        },
        '403': {
          $ref: '#/components/responses/Error403',
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/admin/media/catalog': {
    get: {
      tags: ['Admin Media'],
      summary: 'List active image assets for campaign banners',
      description: 'Returns active image assets across the media library to administrators.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'search',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
          },
        },
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
          },
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
          },
        },
      ],
      responses: {
        '200': {
          description: 'Paginated active image assets.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AdminMediaCatalogResponse',
              },
            },
          },
        },
        '400': {
          description: 'Invalid query parameters.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Authentication required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Administrator role required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/vendor/media': {
    post: {
      tags: ['Vendor Media'],
      summary: 'Upload a media asset (image or video)',
      description:
        'Uploads an image or video file for the authenticated vendor. Automatically processes image variants or extracts a video poster frame.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description:
                    'Image (max 10MB; jpeg, png, webp) or video (max 100MB; mp4, webm, quicktime)',
                },
              },
              required: ['file'],
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Media uploaded and processed successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MediaUploadResponse',
              },
            },
          },
        },
        '400': {
          description: 'Validation Error, missing file, unsupported MIME type, or file too large.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Authentication required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden: caller lacks vendor role or active profile.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '500': {
          description: 'Internal server error during media processing or persistence.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    get: {
      tags: ['Vendor Media'],
      summary: 'List vendor media assets with pagination and filtering',
      description:
        'Returns a paginated list of media assets owned by the authenticated vendor, filterable by status, media type, and filename search.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'status',
          in: 'query',
          required: false,
          schema: {
            default: 'active',
            type: 'string',
            enum: ['active', 'disabled', 'all'],
          },
          description: 'Filter assets by lifecycle status.',
        },
        {
          name: 'mediaType',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['image', 'video'],
          },
          description: 'Filter assets by media type.',
        },
        {
          name: 'search',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
          },
          description: 'Case-insensitive partial filename search.',
        },
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: {
            default: 1,
            type: 'integer',
            minimum: 1,
            maximum: 9007199254740991,
          },
          description: 'Page index (1-based).',
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            default: 20,
            type: 'integer',
            minimum: 1,
            maximum: 100,
          },
          description: 'Number of assets per page (max 100).',
        },
      ],
      responses: {
        '200': {
          description: 'Paginated list of media assets.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/MediaListResponse',
              },
            },
          },
        },
        '400': {
          description: 'Invalid query parameters.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Authentication required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden: caller lacks vendor role or active profile.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/vendor/media/{mediaId}': {
    parameters: [
      {
        name: 'mediaId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
        description: 'UUID of the media asset.',
      },
    ],
    get: {
      tags: ['Vendor Media'],
      summary: 'Get single media asset by ID',
      description:
        'Returns full metadata and resolved URLs for a specific media asset owned by the vendor.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Media asset retrieved successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  media: {
                    $ref: '#/components/schemas/MediaItem',
                  },
                },
                required: ['media'],
              },
            },
          },
        },
        '400': {
          description: 'Invalid mediaId UUID format.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Authentication required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Media asset not found or belongs to another vendor.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['Vendor Media'],
      summary: 'Permanently delete a disabled, unreferenced media asset',
      description:
        'Deletes the database record and removes all physical files from disk. Only permitted when media is in disabled status and has zero product references.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '204': {
          description: 'Media asset permanently deleted.',
        },
        '400': {
          description: 'Media asset is not disabled.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Authentication required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Media asset not found or belongs to another vendor.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '409': {
          description: 'Media asset is in use by products and cannot be deleted.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/vendor/media/{mediaId}/disable': {
    parameters: [
      {
        name: 'mediaId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
        description: 'UUID of the media asset.',
      },
    ],
    patch: {
      tags: ['Vendor Media'],
      summary: 'Disable a media asset and unlink product associations',
      description:
        'Marks media status as disabled, removes all ProductMedia references, and nullifies productImageId on affected products within a transaction.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Media disabled successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Media disabled successfully.',
                  },
                  media: {
                    $ref: '#/components/schemas/MediaItem',
                  },
                },
                required: ['message', 'media'],
              },
            },
          },
        },
        '400': {
          description: 'Invalid UUID format or media is already disabled.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Authentication required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Media asset not found or belongs to another vendor.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/vendor/media/{mediaId}/enable': {
    parameters: [
      {
        name: 'mediaId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
        description: 'UUID of the media asset.',
      },
    ],
    patch: {
      tags: ['Vendor Media'],
      summary: 'Re-activate a disabled media asset',
      description:
        'Transitions media status from disabled back to active, making it eligible again for product assignment.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Media enabled successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Media enabled successfully.',
                  },
                  media: {
                    $ref: '#/components/schemas/MediaItem',
                  },
                },
                required: ['message', 'media'],
              },
            },
          },
        },
        '400': {
          description: 'Media is already active.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Authentication required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Forbidden.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Media asset not found.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/vendor/media/bulk': {
    post: {
      tags: ['Vendor Media'],
      summary: 'Perform bulk action on vendor media assets',
      description: 'Bulk enables, disables, or permanently deletes a list of vendor media assets.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  enum: ['enable', 'disable', 'delete'],
                },
                mediaIds: {
                  minItems: 1,
                  maxItems: 100,
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'uuid',
                    pattern:
                      '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
                  },
                },
              },
              required: ['action', 'mediaIds'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Bulk action completed with summary report.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BulkMediaActionResponse',
              },
            },
          },
        },
        '400': {
          description: 'Validation error.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          $ref: '#/components/responses/Error401',
        },
        '403': {
          $ref: '#/components/responses/Error403',
        },
      },
    },
  },
};
