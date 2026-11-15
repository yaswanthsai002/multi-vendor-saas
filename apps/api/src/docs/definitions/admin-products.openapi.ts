export const adminProductsTags = [
  {
    name: 'Admin Products',
    description: 'Administrative catalog inspection and moderation.',
  },
];

export const adminProductsSchemas = {
  ListAdminProductsResponse: {
    type: 'object',
    properties: {
      products: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            price: {
              type: 'string',
            },
            mrp: {
              type: 'string',
            },
            stock: {
              type: 'number',
            },
            published: {
              type: 'boolean',
            },
            moderationStatus: {
              type: 'string',
              enum: ['rejected', 'approved', 'hidden'],
            },
            moderationReason: {
              type: ['null', 'string'],
            },
            isFeatured: {
              type: 'boolean',
            },
            imageUrl: {
              type: ['null', 'string'],
            },
            createdAt: {
              type: 'string',
            },
            vendor: {
              type: 'object',
              properties: {
                vendorId: {
                  type: 'string',
                  format: 'uuid',
                },
                name: {
                  type: 'string',
                },
                slug: {
                  type: 'string',
                },
                status: {
                  type: 'string',
                  enum: ['active', 'suspended', 'pending', 'rejected'],
                },
              },
              required: ['vendorId', 'name', 'slug', 'status'],
            },
          },
          required: [
            'productId',
            'name',
            'slug',
            'price',
            'mrp',
            'stock',
            'published',
            'moderationStatus',
            'moderationReason',
            'isFeatured',
            'imageUrl',
            'createdAt',
            'vendor',
          ],
        },
      },
      counts: {
        type: 'object',
        properties: {
          total: {
            type: 'number',
          },
          approved: {
            type: 'number',
          },
          hidden: {
            type: 'number',
          },
          rejected: {
            type: 'number',
          },
        },
        required: ['total', 'approved', 'hidden', 'rejected'],
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
    required: ['products', 'counts', 'pagination'],
  },
  GetAdminProductDetailResponse: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        format: 'uuid',
      },
      name: {
        type: 'string',
      },
      slug: {
        type: 'string',
      },
      shortDescription: {
        type: ['null', 'string'],
      },
      description: {
        type: 'string',
      },
      price: {
        type: 'string',
      },
      mrp: {
        type: 'string',
      },
      stock: {
        type: 'number',
      },
      published: {
        type: 'boolean',
      },
      moderationStatus: {
        type: 'string',
        enum: ['rejected', 'approved', 'hidden'],
      },
      moderationReason: {
        type: ['null', 'string'],
      },
      isFeatured: {
        type: 'boolean',
      },
      imageUrl: {
        type: ['null', 'string'],
      },
      createdAt: {
        type: 'string',
      },
      updatedAt: {
        type: 'string',
      },
      vendor: {
        anyOf: [
          {
            type: 'null',
          },
          {
            type: 'object',
            properties: {
              vendorId: {
                type: 'string',
                format: 'uuid',
              },
              name: {
                type: 'string',
              },
              slug: {
                type: 'string',
              },
              status: {
                type: 'string',
                enum: ['active', 'suspended', 'pending', 'rejected'],
              },
            },
            required: ['vendorId', 'name', 'slug', 'status'],
          },
        ],
      },
    },
    required: [
      'productId',
      'name',
      'slug',
      'shortDescription',
      'description',
      'price',
      'mrp',
      'stock',
      'published',
      'moderationStatus',
      'moderationReason',
      'isFeatured',
      'imageUrl',
      'createdAt',
      'updatedAt',
      'vendor',
    ],
  },
  UpdateProductModerationResponse: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        format: 'uuid',
      },
      moderationStatus: {
        type: 'string',
        enum: ['rejected', 'approved', 'hidden'],
      },
      message: {
        type: 'string',
      },
    },
    required: ['productId', 'moderationStatus', 'message'],
  },
  AdminUpdateProductModerationInput: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['approved', 'hidden', 'rejected'],
      },
      reason: {
        type: 'string',
        maxLength: 500,
      },
    },
    required: ['status'],
    allOf: [
      {
        if: {
          properties: {
            status: {
              const: 'rejected',
            },
          },
        },
        then: {
          required: ['reason'],
          properties: {
            reason: {
              minLength: 3,
            },
          },
        },
      },
    ],
  },
  UpdateProductFeaturedFlagResponse: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        format: 'uuid',
      },
      isFeatured: {
        type: 'boolean',
      },
    },
    required: ['productId', 'isFeatured'],
  },
  AdminToggleProductFeaturedInput: {
    type: 'object',
    properties: {
      isFeatured: {
        type: 'boolean',
      },
    },
    required: ['isFeatured'],
  },
};

export const adminProductsPaths = {
  '/api/admin/products': {
    get: {
      tags: ['Admin Products'],
      summary: 'List admin products',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
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
          example: 1,
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
          example: 20,
        },
        {
          name: 'search',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
          },
          example: 'Example',
        },
        {
          name: 'vendorId',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'uuid',
            pattern:
              '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
          },
          example: '11111111-1111-4111-8111-111111111111',
        },
        {
          name: 'categoryId',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'uuid',
            pattern:
              '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
          },
          example: '11111111-1111-4111-8111-111111111111',
        },
        {
          name: 'moderationStatus',
          in: 'query',
          required: false,
          schema: {
            default: 'all',
            type: 'string',
            enum: ['all', 'approved', 'hidden', 'rejected'],
          },
          example: 'all',
        },
        {
          name: 'isFeatured',
          in: 'query',
          required: false,
          schema: {
            default: 'all',
            type: 'string',
            enum: ['all', 'true', 'false'],
          },
          example: 'all',
        },
        {
          name: 'published',
          in: 'query',
          required: false,
          schema: {
            default: 'all',
            type: 'string',
            enum: ['all', 'true', 'false'],
          },
          example: 'all',
        },
        {
          name: 'sortBy',
          in: 'query',
          required: false,
          schema: {
            default: 'createdAt',
            type: 'string',
            enum: ['name', 'vendor', 'price', 'createdAt'],
          },
          example: 'createdAt',
        },
        {
          name: 'sortOrder',
          in: 'query',
          required: false,
          schema: {
            default: 'desc',
            type: 'string',
            enum: ['asc', 'desc'],
          },
          example: 'desc',
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ListAdminProductsResponse',
              },
              example: {
                products: [
                  {
                    productId: '11111111-1111-4111-8111-111111111111',
                    name: 'Example',
                    slug: 'Example',
                    price: '99.00',
                    mrp: 'Example',
                    stock: 1,
                    published: true,
                    moderationStatus: 'rejected',
                    moderationReason: 'Example',
                    isFeatured: true,
                    imageUrl: 'https://example.com/asset.webp',
                    createdAt: 'Example',
                    vendor: {
                      vendorId: '11111111-1111-4111-8111-111111111111',
                      name: 'Example',
                      slug: 'Example',
                      status: 'active',
                    },
                  },
                ],
                counts: {
                  total: 1,
                  approved: 1,
                  hidden: 1,
                  rejected: 1,
                },
                pagination: {
                  page: 1,
                  limit: 1,
                  total: 1,
                  totalPages: 1,
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
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/admin/products/{productId}': {
    get: {
      tags: ['Admin Products'],
      summary: 'Get admin product detail',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. Soft-deleted products are not returned.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'productId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          example: '11111111-1111-4111-8111-111111111111',
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/GetAdminProductDetailResponse',
              },
              example: {
                productId: '11111111-1111-4111-8111-111111111111',
                name: 'Example',
                slug: 'Example',
                shortDescription: 'Example',
                description: 'Example',
                price: '99.00',
                mrp: 'Example',
                stock: 1,
                published: true,
                moderationStatus: 'rejected',
                moderationReason: 'Example',
                isFeatured: true,
                imageUrl: 'https://example.com/asset.webp',
                createdAt: 'Example',
                updatedAt: 'Example',
                vendor: {
                  vendorId: '11111111-1111-4111-8111-111111111111',
                  name: 'Example',
                  slug: 'Example',
                  status: 'active',
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
        '404': {
          $ref: '#/components/responses/Error404',
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/admin/products/{productId}/moderation': {
    patch: {
      tags: ['Admin Products'],
      summary: 'Update product moderation',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. Rejection requires a reason of at least three characters.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'productId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          example: '11111111-1111-4111-8111-111111111111',
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateProductModerationResponse',
              },
              example: {
                productId: '11111111-1111-4111-8111-111111111111',
                moderationStatus: 'rejected',
                message: 'Example',
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
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AdminUpdateProductModerationInput',
            },
            example: {
              status: 'approved',
              reason: 'Example',
            },
          },
        },
      },
    },
  },
  '/api/admin/products/{productId}/feature': {
    patch: {
      tags: ['Admin Products'],
      summary: 'Update product featured flag',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'productId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          example: '11111111-1111-4111-8111-111111111111',
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateProductFeaturedFlagResponse',
              },
              example: {
                productId: '11111111-1111-4111-8111-111111111111',
                isFeatured: true,
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
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AdminToggleProductFeaturedInput',
            },
            example: {
              isFeatured: true,
            },
          },
        },
      },
    },
  },
};
