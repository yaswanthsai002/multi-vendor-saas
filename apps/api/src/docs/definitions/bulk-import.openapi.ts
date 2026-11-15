export const bulkImportTags = [
  {
    name: 'Vendor Bulk Import',
    description: 'Vendor CSV bulk product import workflow endpoints',
  },
];

export const bulkImportSchemas = {
  BulkGetActiveImportResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        const: true,
      },
      data: {
        anyOf: [
          {
            type: 'null',
          },
          {
            type: 'object',
            properties: {
              importId: {
                type: 'string',
                format: 'uuid',
              },
              vendorId: {
                type: 'string',
                format: 'uuid',
              },
              status: {
                type: 'string',
                enum: [
                  'UPLOADING',
                  'VALIDATING',
                  'NEEDS_REVIEW',
                  'IMPORTING',
                  'COMPLETED',
                  'FAILED',
                ],
              },
              filename: {
                type: 'string',
              },
              objectKey: {
                type: 'string',
              },
              totalRows: {
                type: 'number',
              },
              processedRows: {
                type: 'number',
              },
              readyRows: {
                type: 'number',
              },
              needsAttentionRows: {
                type: 'number',
              },
              importedRows: {
                type: 'number',
              },
              errorsKey: {
                type: ['string'],
              },
              error: {
                type: ['string'],
              },
              createdAt: {
                type: 'string',
              },
              updatedAt: {
                type: 'string',
              },
              errorsUrl: {
                type: ['string'],
              },
            },
            required: [
              'importId',
              'vendorId',
              'status',
              'filename',
              'objectKey',
              'totalRows',
              'processedRows',
              'readyRows',
              'needsAttentionRows',
              'importedRows',
              'createdAt',
              'updatedAt',
            ],
          },
        ],
      },
    },
    required: ['success', 'data'],
  },
  BulkConfirmUploadedResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        const: true,
      },
      data: {
        type: 'object',
        properties: {
          importId: {
            type: 'string',
            format: 'uuid',
          },
          vendorId: {
            type: 'string',
            format: 'uuid',
          },
          status: {
            type: 'string',
            enum: ['UPLOADING', 'VALIDATING', 'NEEDS_REVIEW', 'IMPORTING', 'COMPLETED', 'FAILED'],
          },
          filename: {
            type: 'string',
          },
          objectKey: {
            type: 'string',
          },
          totalRows: {
            type: 'number',
          },
          processedRows: {
            type: 'number',
          },
          readyRows: {
            type: 'number',
          },
          needsAttentionRows: {
            type: 'number',
          },
          importedRows: {
            type: 'number',
          },
          errorsKey: {
            type: ['string'],
          },
          error: {
            type: ['string'],
          },
          createdAt: {
            type: 'string',
          },
          updatedAt: {
            type: 'string',
          },
        },
        required: [
          'importId',
          'vendorId',
          'status',
          'filename',
          'objectKey',
          'totalRows',
          'processedRows',
          'readyRows',
          'needsAttentionRows',
          'importedRows',
          'createdAt',
          'updatedAt',
        ],
      },
    },
    required: ['success', 'data'],
  },
  BulkStartImportResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        const: true,
      },
      data: {
        type: 'object',
        properties: {
          importId: {
            type: 'string',
            format: 'uuid',
          },
          vendorId: {
            type: 'string',
            format: 'uuid',
          },
          status: {
            type: 'string',
            enum: ['UPLOADING', 'VALIDATING', 'NEEDS_REVIEW', 'IMPORTING', 'COMPLETED', 'FAILED'],
          },
          filename: {
            type: 'string',
          },
          objectKey: {
            type: 'string',
          },
          totalRows: {
            type: 'number',
          },
          processedRows: {
            type: 'number',
          },
          readyRows: {
            type: 'number',
          },
          needsAttentionRows: {
            type: 'number',
          },
          importedRows: {
            type: 'number',
          },
          errorsKey: {
            type: ['string'],
          },
          error: {
            type: ['string'],
          },
          createdAt: {
            type: 'string',
          },
          updatedAt: {
            type: 'string',
          },
        },
        required: [
          'importId',
          'vendorId',
          'status',
          'filename',
          'objectKey',
          'totalRows',
          'processedRows',
          'readyRows',
          'needsAttentionRows',
          'importedRows',
          'createdAt',
          'updatedAt',
        ],
      },
    },
    required: ['success', 'data'],
  },
  BulkCancelImportResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        const: true,
      },
      data: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
        },
        required: ['success'],
      },
    },
    required: ['success', 'data'],
  },
  BulkGetErrorsDownloadUrlResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        const: true,
      },
      data: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
          },
          expiresIn: {
            type: 'number',
          },
        },
        required: ['url', 'expiresIn'],
      },
    },
    required: ['success', 'data'],
  },
  BulkImportEvent: {
    type: 'object',
    properties: {
      importId: {
        type: 'string',
        format: 'uuid',
      },
      status: {
        type: 'string',
        enum: ['UPLOADING', 'VALIDATING', 'NEEDS_REVIEW', 'IMPORTING', 'COMPLETED', 'FAILED'],
      },
      totalRows: {
        type: 'integer',
      },
      processedRows: {
        type: 'integer',
      },
      readyRows: {
        type: 'integer',
      },
      needsAttentionRows: {
        type: 'integer',
      },
      importedRows: {
        type: 'integer',
      },
      percent: {
        type: 'number',
      },
      stage: {
        type: 'string',
      },
      statusText: {
        type: 'string',
      },
      errorsUrl: {
        type: 'string',
        format: 'uri',
      },
      attempt: {
        type: 'integer',
      },
      maxAttempts: {
        type: 'integer',
      },
      isRetry: {
        type: 'boolean',
      },
    },
    required: [
      'importId',
      'status',
      'totalRows',
      'processedRows',
      'readyRows',
      'needsAttentionRows',
      'importedRows',
      'percent',
    ],
  },
};

export const bulkImportPaths = {
  '/api/vendor/products/bulk-imports/template': {
    get: {
      tags: ['Vendor Bulk Import'],
      summary: 'Download bulk product import Excel template (.xlsx)',
      description:
        'Generates a pre-formatted 2-sheet Excel (.xlsx) template. Sheet 1 contains product columns with data validation dropdown referencing category hierarchy in Sheet 2.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Excel (.xlsx) template file download.',
          content: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
              schema: {
                type: 'string',
                format: 'binary',
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
          description: 'Active vendor profile required.',
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
  '/api/vendor/products/bulk-imports/initiate': {
    post: {
      tags: ['Vendor Bulk Import'],
      summary: 'Initiate bulk Excel/CSV product import session',
      description: 'Acquires single-active-import lock and returns presigned R2 PUT URL.',
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
                filename: {
                  type: 'string',
                  minLength: 1,
                  maxLength: 255,
                  pattern: '\\.(xlsx|csv)$',
                  example: 'products.xlsx',
                },
              },
              required: ['filename'],
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Import session initiated.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  data: {
                    type: 'object',
                    properties: {
                      importId: {
                        type: 'string',
                        format: 'uuid',
                      },
                      uploadUrl: {
                        type: 'string',
                      },
                      objectKey: {
                        type: 'string',
                      },
                      expiresIn: {
                        type: 'number',
                        example: 900,
                      },
                    },
                  },
                },
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
        '409': {
          description: 'Import already in progress.',
        },
      },
    },
  },
  '/api/vendor/products/bulk-imports/active': {
    get: {
      tags: ['Vendor Bulk Import'],
      summary: 'Get current active import session',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BulkGetActiveImportResponse',
              },
              example: {
                success: true,
                data: {
                  importId: '11111111-1111-4111-8111-111111111111',
                  vendorId: '11111111-1111-4111-8111-111111111111',
                  status: 'UPLOADING',
                  filename: 'Example',
                  objectKey: 'Example',
                  totalRows: 1,
                  processedRows: 1,
                  readyRows: 1,
                  needsAttentionRows: 1,
                  importedRows: 1,
                  errorsKey: 'Example',
                  error: 'Example',
                  createdAt: 'Example',
                  updatedAt: 'Example',
                  errorsUrl: 'https://example.com/asset.webp',
                },
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
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/vendor/products/bulk-imports/{importId}/uploaded': {
    post: {
      tags: ['Vendor Bulk Import'],
      summary: 'Confirm CSV upload and enqueue validation',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'importId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BulkConfirmUploadedResponse',
              },
              example: {
                success: true,
                data: {
                  importId: '11111111-1111-4111-8111-111111111111',
                  vendorId: '11111111-1111-4111-8111-111111111111',
                  status: 'UPLOADING',
                  filename: 'Example',
                  objectKey: 'Example',
                  totalRows: 1,
                  processedRows: 1,
                  readyRows: 1,
                  needsAttentionRows: 1,
                  importedRows: 1,
                  errorsKey: 'Example',
                  error: 'Example',
                  createdAt: 'Example',
                  updatedAt: 'Example',
                },
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
        '404': {
          $ref: '#/components/responses/Error404',
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/vendor/products/bulk-imports/{importId}/start': {
    post: {
      tags: ['Vendor Bulk Import'],
      summary: 'Start creating valid products in database',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'importId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BulkStartImportResponse',
              },
              example: {
                success: true,
                data: {
                  importId: '11111111-1111-4111-8111-111111111111',
                  vendorId: '11111111-1111-4111-8111-111111111111',
                  status: 'UPLOADING',
                  filename: 'Example',
                  objectKey: 'Example',
                  totalRows: 1,
                  processedRows: 1,
                  readyRows: 1,
                  needsAttentionRows: 1,
                  importedRows: 1,
                  errorsKey: 'Example',
                  error: 'Example',
                  createdAt: 'Example',
                  updatedAt: 'Example',
                },
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
        '404': {
          $ref: '#/components/responses/Error404',
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/vendor/products/bulk-imports/{importId}': {
    delete: {
      tags: ['Vendor Bulk Import'],
      summary: 'Cancel import session and cleanup storage',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'importId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BulkCancelImportResponse',
              },
              example: {
                success: true,
                data: {
                  success: true,
                },
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
        '404': {
          $ref: '#/components/responses/Error404',
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/vendor/products/bulk-imports/{importId}/errors': {
    get: {
      tags: ['Vendor Bulk Import'],
      summary: 'Get presigned download URL for errors CSV',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'importId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/BulkGetErrorsDownloadUrlResponse',
              },
              example: {
                success: true,
                data: {
                  url: 'https://example.com/asset.webp',
                  expiresIn: 1,
                },
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
        '404': {
          $ref: '#/components/responses/Error404',
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/vendor/products/bulk-imports/{importId}/events': {
    get: {
      tags: ['Vendor Bulk Import'],
      summary: 'Stream bulk import progress',
      description:
        'Requires a valid session and an active owned vendor storefront. Verifies import ownership before opening the stream. Sends an initial JSON snapshot, then unnamed data events with JSON BulkImportEvent payloads. Sends a heartbeat comment every 15 seconds. Use EventSource with credentials. The stream ends when the client disconnects.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'importId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Server-sent progress events. Each data payload follows BulkImportEvent.',
          headers: {
            'Cache-Control': {
              schema: {
                type: 'string',
                const: 'no-cache, no-transform',
              },
            },
            'X-Accel-Buffering': {
              schema: {
                type: 'string',
                const: 'no',
              },
            },
          },
          content: {
            'text/event-stream': {
              schema: {
                type: 'string',
              },
              example:
                'data: {"importId":"11111111-1111-4111-8111-111111111111","status":"UPLOADING","totalRows":1,"processedRows":1,"readyRows":1,"needsAttentionRows":1,"importedRows":1,"percent":1,"stage":"Example","statusText":"Example","errorsUrl":"https://example.com/asset.webp","attempt":1,"maxAttempts":1,"isRetry":true}\n\n: heartbeat\n\n',
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
        '404': {
          $ref: '#/components/responses/Error404',
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
};
