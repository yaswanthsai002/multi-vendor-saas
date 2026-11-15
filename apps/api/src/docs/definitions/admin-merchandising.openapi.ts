export const adminMerchandisingTags = [
  {
    name: 'Admin Merchandising',
    description: 'Administrative merchandising overview.',
  },
];

export const adminMerchandisingSchemas = {
  GetAdminMerchandisingOverviewResponse: {
    type: 'object',
    properties: {
      counts: {
        type: 'object',
        properties: {
          featuredProducts: {
            type: 'number',
          },
          featuredBrands: {
            type: 'number',
          },
          activeDeals: {
            type: 'number',
          },
        },
        required: ['featuredProducts', 'featuredBrands', 'activeDeals'],
      },
      featuredProducts: {
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
            price: {
              type: 'string',
            },
            vendorName: {
              type: 'string',
            },
          },
          required: ['productId', 'name', 'price', 'vendorName'],
        },
      },
      featuredBrands: {
        type: 'array',
        items: {
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
            status: {
              type: 'string',
              enum: ['active', 'suspended', 'pending', 'rejected'],
            },
          },
          required: ['vendorId', 'name', 'slug', 'logoUrl', 'status'],
        },
      },
    },
    required: ['counts', 'featuredProducts', 'featuredBrands'],
  },
};

export const adminMerchandisingPaths = {
  '/api/admin/merchandising/overview': {
    get: {
      tags: ['Admin Merchandising'],
      summary: 'Get admin merchandising overview',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. Returns up to ten featured products and brands, plus the count of active deals.',
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
                $ref: '#/components/schemas/GetAdminMerchandisingOverviewResponse',
              },
              example: {
                counts: {
                  featuredProducts: 1,
                  featuredBrands: 1,
                  activeDeals: 1,
                },
                featuredProducts: [
                  {
                    productId: '11111111-1111-4111-8111-111111111111',
                    name: 'Example',
                    price: '99.00',
                    vendorName: 'Example',
                  },
                ],
                featuredBrands: [
                  {
                    vendorId: '11111111-1111-4111-8111-111111111111',
                    name: 'Example',
                    slug: 'Example',
                    logoUrl: 'https://example.com/asset.webp',
                    status: 'active',
                  },
                ],
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
};
