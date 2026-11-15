export const cartTags = [
  {
    name: 'Cart',
    description: 'Authenticated customer cart management',
  },
];

export const cartSchemas = {
  CartResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          oneOf: [
            {
              type: 'object',
              properties: {
                productId: {
                  type: 'string',
                  format: 'uuid',
                },
                quantity: {
                  type: 'integer',
                  minimum: 1,
                },
                available: {
                  type: 'boolean',
                  enum: [false],
                },
              },
              required: ['productId', 'quantity', 'available'],
            },
            {
              type: 'object',
              properties: {
                productId: {
                  type: 'string',
                  format: 'uuid',
                },
                quantity: {
                  type: 'integer',
                  minimum: 1,
                },
                available: {
                  type: 'boolean',
                  enum: [true],
                },
                name: {
                  type: 'string',
                },
                slug: {
                  type: 'string',
                },
                price: {
                  type: 'string',
                  description:
                    'Current price, using an active published campaign deal when available.',
                },
                mrp: {
                  type: ['string', 'null'],
                },
                stock: {
                  type: 'integer',
                  minimum: 0,
                },
                imageUrl: {
                  type: ['string', 'null'],
                  format: 'uri',
                },
                vendorId: {
                  type: 'string',
                  format: 'uuid',
                },
                vendorName: {
                  type: 'string',
                },
                lineTotal: {
                  type: 'string',
                  description: 'Current price multiplied by item quantity.',
                },
              },
              required: [
                'productId',
                'quantity',
                'available',
                'name',
                'slug',
                'price',
                'mrp',
                'stock',
                'imageUrl',
                'vendorId',
                'vendorName',
                'lineTotal',
              ],
            },
          ],
        },
      },
      subtotal: {
        type: 'string',
        description: 'Sum of current prices for available cart items.',
      },
      itemCount: {
        type: 'integer',
        minimum: 0,
      },
    },
    required: ['items', 'subtotal', 'itemCount'],
  },
};

export const cartPaths = {
  '/api/cart': {
    get: {
      tags: ['Cart'],
      summary: 'Get the authenticated customer cart',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description:
            'Cart items, with unavailable lines redacted, and server-calculated subtotal.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CartResponse',
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
  '/api/cart/items': {
    post: {
      tags: ['Cart'],
      summary: 'Add quantity to a cart product',
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
                quantity: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 999,
                },
              },
              required: ['productId', 'quantity'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated cart.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CartResponse',
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/Error400',
        },
        '401': {
          description: 'Authentication required.',
        },
        '403': {
          $ref: '#/components/responses/Error403',
        },
        '409': {
          description: 'Requested quantity exceeds stock.',
        },
      },
    },
  },
  '/api/cart/items/{productId}': {
    put: {
      tags: ['Cart'],
      summary: 'Set a cart item quantity',
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
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                quantity: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 999,
                },
              },
              required: ['quantity'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Updated cart.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CartResponse',
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/Error400',
        },
        '401': {
          description: 'Authentication required.',
        },
        '403': {
          $ref: '#/components/responses/Error403',
        },
        '404': {
          description: 'Product or cart item unavailable.',
        },
        '409': {
          description: 'Requested quantity exceeds stock.',
        },
      },
    },
    delete: {
      tags: ['Cart'],
      summary: 'Remove an item from the authenticated cart',
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
          description: 'Item removed.',
        },
        '401': {
          description: 'Authentication required.',
        },
        '403': {
          $ref: '#/components/responses/Error403',
        },
      },
    },
  },
};
