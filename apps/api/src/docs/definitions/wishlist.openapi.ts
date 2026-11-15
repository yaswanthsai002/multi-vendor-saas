export const wishlistTags = [
  {
    name: 'Wishlist',
    description: 'Authenticated customer saved products',
  },
];

export const wishlistSchemas = {
  WishlistResponse: {
    type: 'object',
    properties: {
      items: {
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
              type: 'integer',
              minimum: 0,
            },
            imageUrl: {
              type: ['string', 'null'],
              format: 'uri',
            },
            vendorName: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: [
            'productId',
            'name',
            'slug',
            'price',
            'mrp',
            'stock',
            'imageUrl',
            'vendorName',
            'createdAt',
          ],
        },
      },
    },
    required: ['items'],
  },
};

export const wishlistPaths = {
  '/api/wishlist/items': {
    post: {
      tags: ['Wishlist'],
      summary: 'Save a product to the authenticated customer wishlist',
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
                productId: {
                  type: 'string',
                  format: 'uuid',
                  pattern:
                    '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
                },
              },
              required: ['productId'],
              example: {
                productId: 'e6c6a4de-e718-4ecb-a0d7-9d0aefb38c6e',
              },
            },
          },
        },
      },
      responses: {
        '204': {
          description: 'Product saved.',
        },
        '400': {
          description: 'Invalid product ID.',
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
          description: 'Active account required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Product unavailable.',
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
  '/api/wishlist/items/{productId}': {
    delete: {
      tags: ['Wishlist'],
      summary: 'Remove a product from the authenticated customer wishlist',
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
        },
      ],
      responses: {
        '204': {
          description: 'Wishlist item removed.',
        },
        '400': {
          description: 'Invalid product ID.',
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
          description: 'Active account required.',
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
  '/api/wishlist': {
    get: {
      tags: ['Wishlist'],
      summary: 'Get the authenticated customer wishlist',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Wishlist with currently available catalog products.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/WishlistResponse',
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
          description: 'Active account required.',
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
