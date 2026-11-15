export const vendorProductsTags = [
  {
    name: 'Vendor Products',
    description: 'Vendor product catalog management endpoints',
  },
];

export const vendorProductsSchemas = {
  VendorProduct: {
    type: 'object',
    properties: {
      primaryImage: {
        anyOf: [
          {
            type: 'null',
          },
          {
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
        ],
      },
      gallery: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sortOrder: {
              type: 'number',
            },
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
            'sortOrder',
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
      media: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sortOrder: {
              type: 'number',
            },
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
            'sortOrder',
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
      categories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            categoryId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            slug: {
              type: 'string',
            },
            imageUrl: {
              type: ['null', 'string'],
            },
          },
          required: ['categoryId', 'name', 'slug', 'imageUrl'],
        },
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
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
      description: {
        type: 'string',
      },
      isFeatured: {
        type: 'boolean',
      },
      productId: {
        type: 'string',
        format: 'uuid',
      },
      shortDescription: {
        type: ['null', 'string'],
      },
      productImageId: {
        type: ['null', 'string'],
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
      isSoftDeleted: {
        type: ['null', 'boolean'],
      },
      moderationStatus: {
        type: 'string',
        enum: ['rejected', 'approved', 'hidden'],
      },
      moderationReason: {
        type: ['null', 'string'],
      },
      softDeletedAt: {
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
      'primaryImage',
      'gallery',
      'media',
      'categories',
      'createdAt',
      'updatedAt',
      'vendorId',
      'name',
      'slug',
      'description',
      'isFeatured',
      'productId',
      'shortDescription',
      'productImageId',
      'price',
      'mrp',
      'stock',
      'published',
      'isSoftDeleted',
      'moderationStatus',
      'moderationReason',
      'softDeletedAt',
    ],
  },
  CreateProductInput: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 255,
        example: 'Ergonomic Mechanical Keyboard',
      },
      shortDescription: {
        anyOf: [
          {
            type: 'string',
            maxLength: 500,
          },
          {
            type: 'null',
          },
        ],
        example: 'Premium wireless mechanical keyboard.',
      },
      description: {
        default: '',
        type: 'string',
        example: 'Premium hot-swappable mechanical keyboard with RGB backlighting.',
      },
      price: {
        type: 'string',
        pattern: '^\\d{1,10}(\\.\\d{1,2})?$',
        example: '129.99',
      },
      mrp: {
        type: 'string',
        minLength: 1,
        pattern: '^\\d{1,10}(\\.\\d{1,2})?$',
        description: 'Required; must be at least the selling price.',
        example: '149.99',
      },
      stock: {
        type: 'integer',
        minimum: 1,
        maximum: 9007199254740991,
        example: 50,
      },
      productImageId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
            pattern:
              '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
          },
          {
            type: 'null',
          },
        ],
        example: null,
      },
      galleryMediaIds: {
        default: [],
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
          pattern:
            '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
        },
        example: [],
      },
      categoryIds: {
        default: [],
        maxItems: 1,
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
          pattern:
            '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
        },
        example: [],
      },
      published: {
        default: false,
        type: 'boolean',
        example: false,
      },
      slug: {
        type: 'string',
        pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
        example: 'ergonomic-mechanical-keyboard',
      },
    },
    required: ['name', 'price', 'mrp', 'stock'],
  },
  UpdateProductInput: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 255,
        example: 'Ergonomic Mechanical Keyboard Pro',
      },
      shortDescription: {
        anyOf: [
          {
            type: 'string',
            maxLength: 500,
          },
          {
            type: 'null',
          },
        ],
        example: 'Updated short summary.',
      },
      description: {
        type: 'string',
        example: 'Updated description for mechanical keyboard.',
      },
      price: {
        type: 'string',
        pattern: '^\\d{1,10}(\\.\\d{1,2})?$',
        example: '139.99',
      },
      mrp: {
        type: 'string',
        pattern: '^\\d{1,10}(\\.\\d{1,2})?$',
        description: 'When provided, must be at least the selling price.',
        example: '159.99',
      },
      stock: {
        type: 'integer',
        minimum: 1,
        maximum: 9007199254740991,
        example: 45,
      },
      published: {
        type: 'boolean',
        example: true,
      },
      productImageId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
            pattern:
              '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
          },
          {
            type: 'null',
          },
        ],
      },
      galleryMediaIds: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
          pattern:
            '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
        },
      },
      categoryIds: {
        maxItems: 1,
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid',
          pattern:
            '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
        },
      },
      slug: {
        type: 'string',
        pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      },
    },
  },
  ProductListResponse: {
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
            isSoftDeleted: {
              type: ['null', 'boolean'],
            },
            rating: {
              type: 'null',
            },
            primaryImage: {
              anyOf: [
                {
                  type: 'null',
                },
                {
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
              ],
            },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  categoryId: {
                    type: 'string',
                    format: 'uuid',
                  },
                  name: {
                    type: 'string',
                  },
                  slug: {
                    type: 'string',
                  },
                  imageUrl: {
                    type: ['null', 'string'],
                  },
                },
                required: ['categoryId', 'name', 'slug', 'imageUrl'],
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            softDeletedAt: {
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
            'productId',
            'name',
            'slug',
            'shortDescription',
            'description',
            'price',
            'mrp',
            'stock',
            'published',
            'isSoftDeleted',
            'rating',
            'primaryImage',
            'categories',
            'createdAt',
            'updatedAt',
            'softDeletedAt',
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
    required: ['products', 'pagination'],
  },
  ProductDetailResponse: {
    type: 'object',
    properties: {
      product: {
        $ref: '#/components/schemas/VendorProduct',
      },
    },
    required: ['product'],
  },
};

export const vendorProductsPaths = {
  '/api/vendor/products': {
    get: {
      tags: ['Vendor Products'],
      summary: 'List products owned by the authenticated vendor',
      description:
        'Returns a paginated list of active (non-soft-deleted) products belonging exclusively to the authenticated vendor.',
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
          description: 'Page number for pagination',
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
          description: 'Number of items per page',
        },
        {
          name: 'search',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
          },
          description: 'Case-insensitive search query matching product name or description',
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
          description: 'Filter products by category UUID',
        },
        {
          name: 'stock',
          in: 'query',
          required: false,
          schema: {
            default: 'all',
            type: 'string',
            enum: ['all', 'in_stock', 'out_of_stock'],
          },
          description: 'Filter products by stock status',
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
          description: 'Filter products by publication status',
        },
        {
          name: 'archived',
          in: 'query',
          required: false,
          schema: {
            default: 'false',
            type: 'string',
            enum: ['true', 'false'],
          },
          description: 'Filter products by archived (soft-deleted) state',
        },
        {
          name: 'sortBy',
          in: 'query',
          required: false,
          schema: {
            default: 'createdAt',
            type: 'string',
            enum: ['createdAt', 'price', 'name', 'stock'],
          },
          description: 'Field to sort products by',
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
          description: 'Sort direction',
        },
      ],
      responses: {
        '200': {
          description: 'Product list retrieved successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProductListResponse',
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/Error400',
        },
        '401': {
          description: 'Authentication required or invalid session.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description:
            'Forbidden: caller lacks vendor role or does not have an active vendor profile.',
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
    post: {
      tags: ['Vendor Products'],
      summary: 'Create a new product under the authenticated vendor',
      description:
        'Creates a new product with server-side vendorId assignment, automatic slug generation, and category association.',
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
              $ref: '#/components/schemas/CreateProductInput',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Product created successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product created successfully.',
                  },
                  product: {
                    $ref: '#/components/schemas/VendorProduct',
                  },
                },
                required: ['message', 'product'],
              },
            },
          },
        },
        '400': {
          description: 'Validation Error or invalid category ID.',
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
  '/api/vendor/products/bulk': {
    post: {
      tags: ['Vendor Products'],
      summary: 'Perform bulk action on products',
      description:
        'Executes publish, unpublish, archive, restore, or delete action on a batch of vendor-owned products.',
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
                  enum: ['publish', 'unpublish', 'archive', 'restore', 'delete'],
                },
                productIds: {
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
              required: ['action', 'productIds'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Bulk product action completed.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                  },
                  total: {
                    type: 'integer',
                  },
                  processed: {
                    type: 'integer',
                  },
                  failedCount: {
                    type: 'integer',
                  },
                  failed: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: {
                          type: 'string',
                          format: 'uuid',
                        },
                        reason: {
                          type: 'string',
                        },
                      },
                    },
                  },
                  message: {
                    type: 'string',
                  },
                },
                required: ['action', 'total', 'processed', 'failedCount', 'failed', 'message'],
              },
            },
          },
        },
        '400': {
          description: 'Invalid input payload.',
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
  '/api/vendor/products/{productId}': {
    parameters: [
      {
        name: 'productId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
        description: 'UUID of the product',
      },
    ],
    get: {
      tags: ['Vendor Products'],
      summary: 'Get a product by ID owned by the authenticated vendor',
      description:
        'Returns product details including linked categories. Returns 404 if product does not belong to vendor or is deleted.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Product details retrieved successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProductDetailResponse',
              },
            },
          },
        },
        '400': {
          description: 'Invalid UUID format.',
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
        '404': {
          description: 'Product not found, belongs to another vendor, or is soft-deleted.',
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
    patch: {
      tags: ['Vendor Products'],
      summary: 'Update a product owned by the authenticated vendor',
      description:
        'Partially updates product fields and category associations. Rejects updates if product is soft-deleted or slug collides.',
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
              $ref: '#/components/schemas/UpdateProductInput',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Product updated successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product updated successfully.',
                  },
                  product: {
                    $ref: '#/components/schemas/VendorProduct',
                  },
                },
                required: ['message', 'product'],
              },
            },
          },
        },
        '400': {
          description: 'Validation Error or empty update body.',
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
          description: 'Product not found or belongs to another vendor.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '409': {
          description: 'Slug collision with another product.',
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
      tags: ['Vendor Products'],
      summary: 'Soft delete a product owned by the authenticated vendor',
      description:
        'Marks product as soft-deleted. Subsequent queries will return 404 while preserving historic order references.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Product deleted successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product deleted successfully.',
                  },
                },
                required: ['message'],
              },
            },
          },
        },
        '400': {
          description: 'Invalid UUID format.',
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
          description: 'Product not found, already deleted, or belongs to another vendor.',
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
  '/api/vendor/products/{productId}/archive': {
    parameters: [
      {
        name: 'productId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
        description: 'UUID of the product to archive',
      },
    ],
    patch: {
      tags: ['Vendor Products'],
      summary: 'Archive a product',
      description:
        'Soft-deletes a product, moving it to Archived state while preserving publication status.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Product archived successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product archived successfully.',
                  },
                  product: {
                    $ref: '#/components/schemas/VendorProduct',
                  },
                },
                required: ['message', 'product'],
              },
            },
          },
        },
        '400': {
          description: 'Product already archived or invalid UUID.',
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
          $ref: '#/components/responses/Error403',
        },
        '404': {
          description: 'Product not found.',
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
  '/api/vendor/products/{productId}/restore': {
    parameters: [
      {
        name: 'productId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
        description: 'UUID of the product to restore',
      },
    ],
    patch: {
      tags: ['Vendor Products'],
      summary: 'Restore an archived product',
      description: 'Restores an archived product back to its previous Published/Unpublished state.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Product restored successfully.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product restored successfully.',
                  },
                  product: {
                    $ref: '#/components/schemas/VendorProduct',
                  },
                },
                required: ['message', 'product'],
              },
            },
          },
        },
        '400': {
          description: 'Product not archived or invalid UUID.',
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
          $ref: '#/components/responses/Error403',
        },
        '404': {
          description: 'Product not found.',
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
};
