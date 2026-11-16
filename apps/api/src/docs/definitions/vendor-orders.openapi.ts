export const vendorOrdersTags = [
  {
    name: 'Vendor Orders',
    description: 'Vendor-owned fulfillment listing, detail, and status transitions.',
  },
];

export const vendorOrdersSchemas = {
  ListVendorOrdersResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        const: true,
      },
      data: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                vendorOrderId: {
                  type: 'string',
                  format: 'uuid',
                },
                orderNumber: {
                  type: 'string',
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
                itemCount: {
                  type: 'number',
                },
                total: {
                  type: 'string',
                },
                placedAt: {
                  type: 'string',
                },
                status: {
                  type: 'string',
                },
              },
              required: [
                'vendorOrderId',
                'orderNumber',
                'customer',
                'itemCount',
                'total',
                'placedAt',
                'status',
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
          statusCounts: {
            type: 'object',
            properties: {
              all: {
                type: 'number',
              },
              pending: {
                type: 'number',
              },
              processing: {
                type: 'number',
              },
              completed: {
                type: 'number',
              },
              cancelled: {
                type: 'number',
              },
            },
            required: ['all', 'pending', 'processing', 'completed', 'cancelled'],
          },
        },
        required: ['items', 'pagination', 'statusCounts'],
      },
    },
    required: ['success', 'data'],
  },
  GetVendorOrderDetailResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        const: true,
      },
      data: {
        type: 'object',
        properties: {
          order: {
            type: 'object',
            properties: {
              orderNumber: {
                type: 'string',
              },
              placedAt: {
                type: 'string',
              },
              overallStatus: {
                type: 'string',
              },
            },
            required: ['orderNumber', 'placedAt', 'overallStatus'],
          },
          fulfillment: {
            type: 'object',
            properties: {
              vendorOrderId: {
                type: 'string',
                format: 'uuid',
              },
              status: {
                type: 'string',
              },
              updatedAt: {
                type: 'string',
              },
              completedAt: {
                type: ['null', 'string'],
              },
              cancellationReason: {
                type: ['null', 'string'],
              },
              allowedActions: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['process', 'complete', 'cancel'],
                },
              },
            },
            required: [
              'vendorOrderId',
              'status',
              'updatedAt',
              'completedAt',
              'cancellationReason',
              'allowedActions',
            ],
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
              phone: {
                type: ['null', 'string'],
              },
            },
            required: ['name', 'email', 'phone'],
          },
          deliveryAddress: {
            anyOf: [
              {
                type: 'null',
              },
              {
                type: 'object',
                properties: {
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
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                orderItemId: {
                  type: 'string',
                  format: 'uuid',
                },
                productId: {
                  type: 'string',
                  format: 'uuid',
                },
                productName: {
                  type: 'string',
                },
                productImageUrl: {
                  type: ['null', 'string'],
                },
                unitPrice: {
                  type: 'string',
                },
                quantity: {
                  type: 'number',
                },
                subtotal: {
                  type: 'string',
                },
              },
              required: [
                'orderItemId',
                'productId',
                'productName',
                'productImageUrl',
                'unitPrice',
                'quantity',
                'subtotal',
              ],
            },
          },
          summary: {
            type: 'object',
            properties: {
              itemCount: {
                type: 'number',
              },
              total: {
                type: 'string',
              },
            },
            required: ['itemCount', 'total'],
          },
        },
        required: ['order', 'fulfillment', 'customer', 'deliveryAddress', 'items', 'summary'],
      },
    },
    required: ['success', 'data'],
  },
  UpdateVendorOrderStatusInput: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['processing', 'completed', 'cancelled'],
      },
      cancellationReason: {
        anyOf: [
          {
            type: 'string',
            minLength: 1,
            maxLength: 500,
          },
          {
            type: 'null',
          },
        ],
      },
    },
    required: ['status'],
  },
};

export const vendorOrdersPaths = {
  '/api/vendor/orders': {
    get: {
      tags: ['Vendor Orders'],
      summary: 'List vendor orders',
      description:
        "Requires an authenticated, active user with the vendor role and an owned vendor profile. The vendor storefront may be suspended; these endpoints do not require an active storefront. Vendor identity is derived from the session. Returns only this vendor's fulfillments with pagination and independent status counts. Date filters accept an ISO date or timestamp; a date-only dateTo includes the full day.",
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
          name: 'status',
          in: 'query',
          required: false,
          schema: {
            default: 'all',
            type: 'string',
            enum: ['all', 'pending', 'processing', 'completed', 'cancelled'],
          },
          example: 'all',
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
          name: 'dateFrom',
          in: 'query',
          required: false,
          schema: {
            anyOf: [
              {
                type: 'string',
                format: 'date-time',
                pattern:
                  '^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$',
              },
              {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              },
            ],
          },
          example: '2026-11-15T10:00:00.000Z',
        },
        {
          name: 'dateTo',
          in: 'query',
          required: false,
          schema: {
            anyOf: [
              {
                type: 'string',
                format: 'date-time',
                pattern:
                  '^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:\\.\\d+)?(?:Z|([+-](?:[01]\\d|2[0-3]):[0-5]\\d)))$',
              },
              {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              },
            ],
          },
          example: '2026-11-15T10:00:00.000Z',
        },
        {
          name: 'sort',
          in: 'query',
          required: false,
          schema: {
            default: 'newest',
            type: 'string',
            enum: ['newest', 'oldest', 'total_desc', 'total_asc'],
          },
          example: 'newest',
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ListVendorOrdersResponse',
              },
              example: {
                success: true,
                data: {
                  items: [
                    {
                      vendorOrderId: '11111111-1111-4111-8111-111111111111',
                      orderNumber: 'Example',
                      customer: {
                        name: 'Example',
                        email: 'customer@example.com',
                      },
                      itemCount: 1,
                      total: '99.00',
                      placedAt: 'Example',
                      status: 'Example',
                    },
                  ],
                  pagination: {
                    page: 1,
                    limit: 1,
                    total: 1,
                    totalPages: 1,
                  },
                  statusCounts: {
                    all: 1,
                    pending: 1,
                    processing: 1,
                    completed: 1,
                    cancelled: 1,
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
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/vendor/orders/{vendorOrderId}': {
    get: {
      tags: ['Vendor Orders'],
      summary: 'Get vendor order detail',
      description:
        'Requires an authenticated, active user with the vendor role and an owned vendor profile. The vendor storefront may be suspended; these endpoints do not require an active storefront. Vendor identity is derived from the session. A fulfillment owned by another vendor returns 404.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'vendorOrderId',
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
                $ref: '#/components/schemas/GetVendorOrderDetailResponse',
              },
              example: {
                success: true,
                data: {
                  order: {
                    orderNumber: 'Example',
                    placedAt: 'Example',
                    overallStatus: 'Example',
                  },
                  fulfillment: {
                    vendorOrderId: '11111111-1111-4111-8111-111111111111',
                    status: 'Example',
                    updatedAt: 'Example',
                    completedAt: 'Example',
                    cancellationReason: 'Example',
                    allowedActions: ['process'],
                  },
                  customer: {
                    name: 'Example',
                    email: 'customer@example.com',
                    phone: '9876543210',
                  },
                  deliveryAddress: {
                    recipientName: 'Example',
                    phone: '9876543210',
                    addressLine1: 'Example',
                    addressLine2: 'Example',
                    city: 'Example',
                    state: 'Example',
                    postalCode: '500001',
                    country: 'IN',
                  },
                  items: [
                    {
                      orderItemId: '11111111-1111-4111-8111-111111111111',
                      productId: '11111111-1111-4111-8111-111111111111',
                      productName: 'Example',
                      productImageUrl: 'https://example.com/asset.webp',
                      unitPrice: '99.00',
                      quantity: 1,
                      subtotal: '99.00',
                    },
                  ],
                  summary: {
                    itemCount: 1,
                    total: '99.00',
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
        '404': {
          $ref: '#/components/responses/Error404',
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/vendor/orders/{vendorOrderId}/status': {
    post: {
      tags: ['Vendor Orders'],
      summary: 'Update vendor order status',
      description:
        'Requires an authenticated, active user with the vendor role and an owned vendor profile. The vendor storefront may be suspended; these endpoints do not require an active storefront. Vendor identity is derived from the session. Allowed transitions: pending to processing or cancelled; processing to completed. Completed and cancelled fulfillments are terminal. The server validates the transition and updates inventory and parent order state atomically. After commit, a best-effort email notifies the customer of the vendor portion status change. Email failure does not fail the status update.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'vendorOrderId',
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
                $ref: '#/components/schemas/GetVendorOrderDetailResponse',
              },
              example: {
                success: true,
                data: {
                  order: {
                    orderNumber: 'Example',
                    placedAt: 'Example',
                    overallStatus: 'Example',
                  },
                  fulfillment: {
                    vendorOrderId: '11111111-1111-4111-8111-111111111111',
                    status: 'Example',
                    updatedAt: 'Example',
                    completedAt: 'Example',
                    cancellationReason: 'Example',
                    allowedActions: ['process'],
                  },
                  customer: {
                    name: 'Example',
                    email: 'customer@example.com',
                    phone: '9876543210',
                  },
                  deliveryAddress: {
                    recipientName: 'Example',
                    phone: '9876543210',
                    addressLine1: 'Example',
                    addressLine2: 'Example',
                    city: 'Example',
                    state: 'Example',
                    postalCode: '500001',
                    country: 'IN',
                  },
                  items: [
                    {
                      orderItemId: '11111111-1111-4111-8111-111111111111',
                      productId: '11111111-1111-4111-8111-111111111111',
                      productName: 'Example',
                      productImageUrl: 'https://example.com/asset.webp',
                      unitPrice: '99.00',
                      quantity: 1,
                      subtotal: '99.00',
                    },
                  ],
                  summary: {
                    itemCount: 1,
                    total: '99.00',
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
              $ref: '#/components/schemas/UpdateVendorOrderStatusInput',
            },
            example: {
              status: 'processing',
              cancellationReason: 'Example',
            },
          },
        },
      },
    },
  },
};
