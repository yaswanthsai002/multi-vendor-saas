export const adminOrdersTags = [
  {
    name: 'Admin Orders',
    description: 'Administrative order and fulfillment oversight.',
  },
];

export const adminOrdersSchemas = {
  AdminOrderSummary: {
    type: 'object',
    properties: {
      total: {
        type: 'string',
        description: 'Exact original item total in INR, including cancelled items.',
      },
      itemCount: { type: 'integer', minimum: 0 },
      vendorCount: { type: 'integer', minimum: 0 },
      cancelledVendorCount: { type: 'integer', minimum: 0 },
      previews: {
        type: 'array',
        maxItems: 2,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            quantity: { type: 'integer', minimum: 0 },
            imageUrl: { type: ['string', 'null'] },
          },
          required: ['name', 'quantity', 'imageUrl'],
        },
      },
    },
    required: ['total', 'itemCount', 'vendorCount', 'cancelledVendorCount', 'previews'],
  },
  ListAdminOrdersResponse: {
    type: 'object',
    properties: {
      orders: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              format: 'uuid',
            },
            summary: { $ref: '#/components/schemas/AdminOrderSummary' },
            orderNumber: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'completed', 'cancelled'],
            },
            customer: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                },
              },
              required: ['name', 'email'],
            },
            createdAt: {
              type: 'string',
            },
          },
          required: ['orderId', 'orderNumber', 'status', 'customer', 'createdAt', 'summary'],
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
    required: ['orders', 'pagination'],
  },
  GetAdminOrderDetailResponse: {
    type: 'object',
    properties: {
      summary: { $ref: '#/components/schemas/AdminOrderSummary' },
      orderId: {
        type: 'string',
        format: 'uuid',
      },
      orderNumber: {
        type: 'string',
      },
      status: {
        type: 'string',
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      },
      createdAt: {
        type: 'string',
      },
      customer: {
        anyOf: [
          {
            type: 'null',
          },
          {
            type: 'object',
            properties: {
              userId: {
                type: 'string',
                format: 'uuid',
              },
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
            },
            required: ['userId', 'name', 'email'],
          },
        ],
      },
      deliveryAddress: {
        anyOf: [
          {
            type: 'object',
            properties: {
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
              orderId: {
                type: 'string',
                format: 'uuid',
              },
              deliveryAddressId: {
                type: 'string',
                format: 'uuid',
              },
              recipientName: {
                type: 'string',
              },
              phone: {
                type: 'string',
              },
              addressLine1: {
                type: 'string',
              },
              addressLine2: {
                type: ['null', 'string'],
              },
              city: {
                type: 'string',
              },
              state: {
                type: 'string',
              },
              postalCode: {
                type: 'string',
              },
              country: {
                type: 'string',
              },
            },
            required: [
              'createdAt',
              'orderId',
              'deliveryAddressId',
              'recipientName',
              'phone',
              'addressLine1',
              'addressLine2',
              'city',
              'state',
              'postalCode',
              'country',
            ],
          },
        ],
      },
      fulfillments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  orderItemId: {
                    type: 'string',
                    format: 'uuid',
                  },
                  vendorOrderId: {
                    type: 'string',
                    format: 'uuid',
                  },
                  imageUrl: { type: ['string', 'null'] },
                  subtotal: { type: 'string' },
                  productName: {
                    type: 'string',
                  },
                  unitPrice: {
                    type: 'string',
                  },
                  cancellationReturnedQuantity: { type: ['integer', 'null'], minimum: 0 },
                  cancellationDamagedQuantity: { type: ['integer', 'null'], minimum: 0 },
                  cancellationMissingQuantity: { type: ['integer', 'null'], minimum: 0 },
                  quantity: {
                    type: 'number',
                  },
                },
                required: [
                  'orderItemId',
                  'vendorOrderId',
                  'productName',
                  'unitPrice',
                  'quantity',
                  'imageUrl',
                  'subtotal',
                ],
              },
            },
            vendorOrderId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled', 'processing'],
            },
            cancellation: { $ref: '#/components/schemas/OrderCancellation' },
            cancellationDetails: {
              type: ['string', 'null'],
              description: 'Administrator-only saved cancellation text.',
            },
            cancelledByUserId: { type: ['string', 'null'], format: 'uuid' },
            completedAt: { type: ['string', 'null'], format: 'date-time' },
            vendorId: {
              type: 'string',
              format: 'uuid',
            },
            total: { type: 'string' },
            vendorName: {
              type: 'string',
            },
            vendorSlug: {
              type: 'string',
            },
            vendorStatus: {
              type: 'string',
              enum: ['active', 'suspended', 'pending', 'rejected'],
            },
          },
          required: [
            'items',
            'vendorOrderId',
            'status',
            'cancellation',
            'cancellationDetails',
            'cancelledByUserId',
            'completedAt',
            'vendorId',
            'vendorName',
            'total',
            'vendorSlug',
            'vendorStatus',
          ],
        },
      },
    },
    required: ['orderId', 'orderNumber', 'status', 'createdAt', 'customer', 'fulfillments'],
  },
};

export const adminOrdersPaths = {
  '/api/admin/orders': {
    get: {
      tags: ['Admin Orders'],
      summary: 'List admin orders',
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
          name: 'status',
          in: 'query',
          required: false,
          schema: {
            default: 'all',
            type: 'string',
            enum: ['all', 'pending', 'confirmed', 'completed', 'cancelled'],
          },
          example: 'all',
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ListAdminOrdersResponse',
              },
              example: {
                orders: [
                  {
                    orderId: '11111111-1111-4111-8111-111111111111',
                    orderNumber: 'Example',
                    summary: {
                      total: '99.00',
                      itemCount: 1,
                      vendorCount: 1,
                      cancelledVendorCount: 0,
                      previews: [{ name: 'Example', quantity: 1, imageUrl: null }],
                    },
                    status: 'pending',
                    customer: {
                      name: 'Example',
                      email: 'customer@example.com',
                    },
                    createdAt: 'Example',
                  },
                ],
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
  '/api/admin/orders/{orderId}': {
    get: {
      tags: ['Admin Orders'],
      summary: 'Get admin order detail',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. Includes the customer, delivery snapshot, and vendor fulfillment items.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'orderId',
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
                $ref: '#/components/schemas/GetAdminOrderDetailResponse',
              },
              example: {
                orderId: '11111111-1111-4111-8111-111111111111',
                orderNumber: 'Example',
                summary: {
                  total: '99.00',
                  itemCount: 1,
                  vendorCount: 1,
                  cancelledVendorCount: 0,
                  previews: [{ name: 'Example', quantity: 1, imageUrl: null }],
                },
                status: 'pending',
                createdAt: 'Example',
                customer: {
                  userId: '11111111-1111-4111-8111-111111111111',
                  name: 'Example',
                  email: 'customer@example.com',
                },
                deliveryAddress: {
                  createdAt: '2026-11-15T10:00:00.000Z',
                  orderId: '11111111-1111-4111-8111-111111111111',
                  deliveryAddressId: '11111111-1111-4111-8111-111111111111',
                  recipientName: 'Example',
                  phone: '9876543210',
                  addressLine1: 'Example',
                  addressLine2: 'Example',
                  city: 'Example',
                  state: 'Example',
                  postalCode: '500001',
                  country: 'IN',
                },
                fulfillments: [
                  {
                    items: [
                      {
                        orderItemId: '11111111-1111-4111-8111-111111111111',
                        vendorOrderId: '11111111-1111-4111-8111-111111111111',
                        imageUrl: null,
                        subtotal: '99.00',
                        productName: 'Example',
                        unitPrice: '99.00',
                        quantity: 1,
                      },
                    ],
                    vendorOrderId: '11111111-1111-4111-8111-111111111111',
                    status: 'pending',
                    cancellation: null,
                    cancellationDetails: null,
                    cancelledByUserId: null,
                    completedAt: null,
                    vendorId: '11111111-1111-4111-8111-111111111111',
                    total: '99.00',
                    vendorName: 'Example',
                    vendorSlug: 'Example',
                    vendorStatus: 'active',
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
