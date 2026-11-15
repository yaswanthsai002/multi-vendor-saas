export const catalogTags = [
  {
    name: 'Catalog',
    description: 'Public customer product browsing and discovery endpoints',
  },
];

export const catalogSchemas = {
  CatalogVendor: {
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
      logoUrl: {
        type: ['string', 'null'],
        format: 'uri',
      },
      tagline: {
        type: ['string', 'null'],
      },
      description: {
        type: ['string', 'null'],
      },
    },
    required: ['vendorId', 'name', 'slug', 'logoUrl'],
  },
  CatalogCategory: {
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
    },
    required: ['categoryId', 'name', 'slug'],
  },
  CatalogProduct: {
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
        type: ['string', 'null'],
      },
      price: {
        type: 'string',
        description:
          'Current price, using an active published campaign deal when available; otherwise product price.',
      },
      mrp: {
        type: 'string',
      },
      stock: {
        type: 'integer',
        minimum: 0,
      },
      isFeatured: {
        type: 'boolean',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      imageUrl: {
        type: ['string', 'null'],
        format: 'uri',
      },
      rating: {
        type: ['number', 'null'],
      },
      ratingCount: {
        type: 'integer',
        minimum: 0,
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
          logoUrl: {
            type: ['null', 'string'],
          },
        },
        required: ['vendorId', 'name', 'slug', 'logoUrl'],
      },
      categories: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CatalogCategory',
        },
      },
    },
    required: [
      'productId',
      'name',
      'slug',
      'shortDescription',
      'price',
      'mrp',
      'stock',
      'isFeatured',
      'createdAt',
      'imageUrl',
      'rating',
      'ratingCount',
      'vendor',
      'categories',
    ],
  },
  CatalogProductDetail: {
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
        type: ['string', 'null'],
      },
      description: {
        type: 'string',
      },
      price: {
        type: 'string',
        description:
          'Current price, using an active published campaign deal when available; otherwise product price.',
      },
      mrp: {
        type: 'string',
      },
      stock: {
        type: 'integer',
        minimum: 0,
      },
      isFeatured: {
        type: 'boolean',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      primaryImage: {
        type: ['string', 'null'],
        format: 'uri',
      },
      gallery: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            mediaId: {
              type: 'string',
              format: 'uuid',
            },
            url: {
              type: 'string',
              format: 'uri',
            },
            sortOrder: {
              type: 'integer',
            },
          },
          required: ['mediaId', 'url', 'sortOrder'],
        },
      },
      categories: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CatalogCategory',
        },
      },
      vendor: {
        $ref: '#/components/schemas/CatalogVendor',
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
      'isFeatured',
      'createdAt',
      'primaryImage',
      'gallery',
      'categories',
      'vendor',
    ],
  },
  CatalogProductsResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CatalogProduct',
        },
      },
      pagination: {
        type: 'object',
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
        required: ['page', 'limit', 'total', 'totalPages'],
      },
    },
    required: ['items', 'pagination'],
  },
  CatalogProductResponse: {
    type: 'object',
    properties: {
      product: {
        $ref: '#/components/schemas/CatalogProductDetail',
      },
    },
    required: ['product'],
  },
  CatalogFacetsResponse: {
    type: 'object',
    properties: {
      priceRange: {
        type: 'object',
        properties: {
          min: {
            type: 'integer',
          },
          max: {
            type: 'integer',
          },
        },
        required: ['min', 'max'],
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
            parentCategoryId: {
              type: ['string', 'null'],
              format: 'uuid',
            },
            productCount: {
              type: 'integer',
              minimum: 0,
            },
          },
          required: ['categoryId', 'name', 'slug', 'parentCategoryId', 'productCount'],
        },
      },
    },
    required: ['priceRange', 'categories'],
  },
};

export const catalogPaths = {
  '/api/brands': {
    get: {
      tags: ['Catalog'],
      summary: 'List active brands with publicly available products',
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: {
            default: 1,
            type: 'integer',
            minimum: 1,
            maximum: 9007199254740991,
          },
          required: false,
        },
        {
          name: 'limit',
          in: 'query',
          schema: {
            default: 24,
            type: 'integer',
            minimum: 1,
            maximum: 48,
          },
          required: false,
        },
        {
          name: 'search',
          in: 'query',
          schema: {
            type: 'string',
            maxLength: 100,
          },
          required: false,
        },
        {
          name: 'featured',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['true', 'false'],
          },
          required: false,
        },
      ],
      responses: {
        '200': {
          description: 'Paginated active brands.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items', 'pagination'],
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: [
                        'vendorId',
                        'name',
                        'slug',
                        'tagline',
                        'description',
                        'logoUrl',
                        'bannerUrl',
                        'isFeatured',
                        'productCount',
                      ],
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
                        tagline: {
                          type: ['string', 'null'],
                        },
                        description: {
                          type: ['string', 'null'],
                        },
                        logoUrl: {
                          type: ['string', 'null'],
                        },
                        bannerUrl: {
                          type: ['string', 'null'],
                        },
                        isFeatured: {
                          type: 'boolean',
                        },
                        productCount: {
                          type: 'integer',
                        },
                      },
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
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid pagination, search, or featured filter.',
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
  '/api/products': {
    get: {
      tags: ['Catalog'],
      summary: 'List public approved products',
      description:
        'Returns paginated list of approved and published products with optional search, category, vendor, price, and stock filters.',
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: {
            default: 1,
            type: 'integer',
            minimum: 1,
            maximum: 9007199254740991,
          },
          required: false,
        },
        {
          name: 'limit',
          in: 'query',
          schema: {
            default: 20,
            type: 'integer',
            minimum: 1,
            maximum: 50,
          },
          required: false,
        },
        {
          name: 'search',
          in: 'query',
          schema: {
            type: 'string',
            maxLength: 100,
          },
          required: false,
        },
        {
          name: 'category',
          in: 'query',
          schema: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            ],
          },
          required: false,
        },
        {
          name: 'vendor',
          in: 'query',
          schema: {
            type: 'string',
          },
          required: false,
        },
        {
          name: 'minPrice',
          in: 'query',
          schema: {
            type: 'number',
            minimum: 0,
          },
          description: 'Filter by current price, including active campaign deals.',
          required: false,
        },
        {
          name: 'maxPrice',
          in: 'query',
          schema: {
            type: 'number',
            minimum: 0,
          },
          description: 'Filter by current price, including active campaign deals.',
          required: false,
        },
        {
          name: 'inStock',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['true', 'false'],
          },
          required: false,
        },
        {
          name: 'isFeatured',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['true', 'false'],
          },
          required: false,
        },
        {
          name: 'sortBy',
          in: 'query',
          schema: {
            default: 'featured',
            type: 'string',
            enum: ['featured', 'price_asc', 'price_desc', 'newest'],
          },
          required: false,
        },
      ],
      responses: {
        '200': {
          description:
            'Paginated public product list. Product price reflects an active published campaign deal when available.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CatalogProductsResponse',
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/Error400',
        },
      },
    },
  },
  '/api/products/facets': {
    get: {
      tags: ['Catalog'],
      summary: 'Get catalog facets and aggregations',
      description:
        'Returns available category product counts and the current price range, including active campaign deals.',
      responses: {
        '200': {
          description: 'Category counts and current price range, including active campaign deals.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CatalogFacetsResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/products/{slug}': {
    get: {
      tags: ['Catalog'],
      summary: 'Get public product details by slug',
      description:
        'Returns complete public details, specifications, vendor info, and gallery images for a published product.',
      parameters: [
        {
          name: 'slug',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'Product unique slug.',
        },
      ],
      responses: {
        '200': {
          description:
            'Product details found. Price reflects an active published campaign deal when available.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CatalogProductResponse',
              },
            },
          },
        },
        '404': {
          description: 'Product not found or not active.',
        },
      },
    },
  },
};
