const publicCancellation = {
  anyOf: [
    { type: 'null' },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        source: { type: 'string', enum: ['customer', 'vendor'] },
        reasonCode: {
          type: ['string', 'null'],
          enum: [
            'OUT_OF_STOCK',
            'QUALITY_ISSUE',
            'LISTING_ERROR',
            'OPERATIONAL_ISSUE',
            'OTHER',
            null,
          ],
        },
        reason: { type: 'string' },
        cancelledAt: { type: ['string', 'null'], format: 'date-time' },
      },
      required: ['source', 'reasonCode', 'reason', 'cancelledAt'],
    },
  ],
} as const;
const quantities = {
  anyOf: [
    { type: 'null' },
    {
      type: 'object',
      additionalProperties: false,
      properties: {
        returnedQuantity: { type: 'integer', minimum: 0 },
        damagedQuantity: { type: 'integer', minimum: 0 },
        missingQuantity: { type: 'integer', minimum: 0 },
      },
      required: ['returnedQuantity', 'damagedQuantity', 'missingQuantity'],
    },
  ],
} as const;
const notificationErrors = {
  '400': { description: 'Invalid UUID, query, cursor or body.' },
  '401': { description: 'Authentication is missing, invalid or expired.' },
  '403': {
    description:
      'Active user with vendor role and owned profile required. Profile suspension is permitted.',
  },
  '500': { description: 'Unexpected failure. No internal details are returned.' },
} as const;
const notificationAccess =
  'Requires cookie authentication, an active user with the vendor role and an owned vendor profile. Profile suspension is permitted. Ownership is derived from the session. No vendor ID is accepted from the client.';
const notificationIdParameter = {
  name: 'notificationId',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
  example: '11111111-1111-4111-8111-111111111111',
} as const;

export const vendorOrdersTags = [
  {
    name: 'Vendor Orders',
    description: 'Vendor-owned fulfillment listing, detail, and status transitions.',
  },
];

export const vendorOrdersSchemas = {
  OrderItemSummary: {
    type: 'object',
    additionalProperties: false,
    properties: {
      items: {
        type: 'array',
        maxItems: 2,
        items: {
          type: 'object',
          properties: { name: { type: 'string' }, quantity: { type: 'integer', minimum: 0 } },
          required: ['name', 'quantity'],
        },
      },
      itemCount: { type: 'integer', minimum: 0 },
      productCount: { type: 'integer', minimum: 0 },
    },
    required: ['items', 'itemCount', 'productCount'],
  },
  OrderCancellation: publicCancellation,
  OrderCancellationQuantities: quantities,
  VendorNotification: {
    type: 'object',
    additionalProperties: false,
    properties: {
      notificationId: { type: 'string', format: 'uuid' },
      vendorOrderId: { type: 'string', format: 'uuid' },
      orderNumber: { type: 'string' },
      summary: { $ref: '#/components/schemas/OrderItemSummary' },
      type: { type: 'string', enum: ['new_order', 'customer_cancelled'] },
      createdAt: { type: 'string', format: 'date-time' },
      readAt: { type: ['string', 'null'], format: 'date-time' },
    },
    required: [
      'notificationId',
      'vendorOrderId',
      'orderNumber',
      'summary',
      'type',
      'createdAt',
      'readAt',
    ],
  },
  VendorNotificationListResponse: {
    type: 'object',
    properties: {
      success: { const: true },
      data: {
        type: 'object',
        additionalProperties: false,
        properties: {
          vendorId: { type: 'string', format: 'uuid' },
          items: { type: 'array', items: { $ref: '#/components/schemas/VendorNotification' } },
          unreadCount: { type: 'integer', minimum: 0 },
          nextCursor: { type: ['string', 'null'] },
        },
        required: ['vendorId', 'items', 'unreadCount', 'nextCursor'],
      },
    },
    required: ['success', 'data'],
  },
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
                summary: { $ref: '#/components/schemas/OrderItemSummary' },
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
                'summary',
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
              cancellation: { $ref: '#/components/schemas/OrderCancellation' },
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
              'cancellation',
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
                cancellationQuantities: {
                  $ref: '#/components/schemas/OrderCancellationQuantities',
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
    oneOf: [
      {
        type: 'object',
        additionalProperties: false,
        properties: { status: { const: 'processing' } },
        required: ['status'],
      },
      {
        type: 'object',
        additionalProperties: false,
        properties: { status: { const: 'completed' } },
        required: ['status'],
      },
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          status: { const: 'cancelled' },
          cancellationReasonCode: {
            type: 'string',
            enum: ['OUT_OF_STOCK', 'QUALITY_ISSUE', 'LISTING_ERROR', 'OPERATIONAL_ISSUE', 'OTHER'],
          },
          cancellationDetails: {
            type: 'string',
            maxLength: 500,
            description:
              'Trimmed administrator-only text. Required and nonblank for OTHER. Never returned to vendors or customers.',
          },
          items: {
            type: 'array',
            minItems: 1,
            description:
              'Exact saved item set with unique IDs. Returned quantity is derived by the server.',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                orderItemId: { type: 'string', format: 'uuid' },
                damagedQuantity: { type: 'integer', minimum: 0, maximum: 2147483647 },
                missingQuantity: { type: 'integer', minimum: 0, maximum: 2147483647 },
              },
              required: ['orderItemId', 'damagedQuantity', 'missingQuantity'],
            },
          },
        },
        required: ['status', 'cancellationReasonCode', 'items'],
        allOf: [
          {
            if: { properties: { cancellationReasonCode: { const: 'OTHER' } } },
            then: {
              required: ['cancellationDetails'],
              properties: { cancellationDetails: { minLength: 1, pattern: '\\S' } },
            },
          },
        ],
      },
    ],
  },
};

export const vendorOrdersPaths = {
  '/api/vendor/notifications/orders/{vendorOrderId}/read': {
    put: {
      tags: ['Vendor Orders'],
      summary: 'Mark notifications read after an order is displayed',
      description: `${notificationAccess} Idempotently marks unread records for this vendor portion only when its current status matches the displayed status. Missing, foreign, deleted, already-read or changed-state portions are no-ops. Preserves the first read timestamp.`,
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'vendorOrderId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          example: '11111111-1111-4111-8111-111111111111',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                status: {
                  type: 'string',
                  enum: ['pending', 'processing', 'completed', 'cancelled'],
                },
              },
              required: ['status'],
            },
            example: { status: 'pending' },
          },
        },
      },
      responses: {
        ...notificationErrors,
        '200': {
          description: 'Server-resolved vendor scope and whether any unread records changed.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { const: true },
                  data: {
                    type: 'object',
                    properties: {
                      vendorId: { type: 'string', format: 'uuid' },
                      changed: { type: 'boolean' },
                    },
                    required: ['vendorId', 'changed'],
                  },
                },
                required: ['success', 'data'],
              },
              example: {
                success: true,
                data: { vendorId: '22222222-2222-4222-8222-222222222222', changed: true },
              },
            },
          },
        },
      },
    },
  },
  '/api/vendor/notifications': {
    get: {
      tags: ['Vendor Orders'],
      summary: 'List saved vendor notifications and unread count',
      description:
        notificationAccess +
        ' Newest-first keyset pagination uses a base64url JSON cursor with a UTC millisecond createdAt and notificationId. Count includes every owned unread record and shares the list statement snapshot. No automatic retention.',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 20, minimum: 1, maximum: 50 },
          example: 20,
        },
        {
          name: 'cursor',
          in: 'query',
          schema: { type: 'string', maxLength: 512 },
          description: 'Use nextCursor from the previous response.',
        },
      ],
      responses: {
        ...notificationErrors,
        '200': {
          description: 'Saved inbox page, server-resolved scope and total unread count.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VendorNotificationListResponse' },
              example: {
                success: true,
                data: {
                  vendorId: '22222222-2222-4222-8222-222222222222',
                  items: [],
                  unreadCount: 0,
                  nextCursor: null,
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/vendor/notifications/events': {
    get: {
      tags: ['Vendor Orders'],
      summary: 'Stream live vendor order signals',
      description:
        notificationAccess +
        ' Sends ready after subscription, notification with notificationId/vendorOrderId/type, refresh with {}, and 15-second comment heartbeats. Rechecks authorization before payloads and heartbeats. Closes at token expiry or loss of access. No replay or Last-Event-ID guarantee. Fetch saved inbox on reconnect. Errors after headers close the stream.',
      security: [{ cookieAuth: [] }],
      responses: {
        ...notificationErrors,
        '200': {
          description: 'Authenticated event stream. No private text or customer address data.',
          content: {
            'text/event-stream': {
              schema: { type: 'string' },
              example: 'event: ready\ndata: {}\n\nevent: refresh\ndata: {}\n\n',
            },
          },
        },
      },
    },
  },
  '/api/vendor/notifications/{notificationId}/read': {
    put: {
      tags: ['Vendor Orders'],
      summary: 'Mark one notification read',
      description:
        notificationAccess +
        ' Idempotent. Preserves first readAt. Missing, deleted and foreign IDs return the same no-op 204. Accepts no body fields. View order uses this operation without blocking navigation.',
      security: [{ cookieAuth: [] }],
      parameters: [notificationIdParameter],
      responses: {
        ...notificationErrors,
        '204': { description: 'Read state saved, or authorized no-op. No body.' },
      },
    },
  },
  '/api/vendor/notifications/{notificationId}': {
    delete: {
      tags: ['Vendor Orders'],
      summary: 'Delete one saved notification',
      description:
        notificationAccess +
        ' Physically removes the owned inbox record. Never deletes the order. Idempotent for missing, deleted and foreign IDs. Deleting a read record does not change unread count. Accepts no body fields.',
      security: [{ cookieAuth: [] }],
      parameters: [notificationIdParameter],
      responses: {
        ...notificationErrors,
        '204': { description: 'Deleted, or authorized no-op. No body.' },
      },
    },
  },
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
                      summary: {
                        items: [{ name: 'Desk lamp', quantity: 1 }],
                        itemCount: 1,
                        productCount: 1,
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
                    cancellation: null,
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
        'Requires an authenticated, active user with the vendor role and an owned vendor profile. The vendor storefront may be suspended; these endpoints do not require an active storefront. Vendor identity is derived from the session. Allowed transitions: pending to processing or cancelled; processing to completed or cancelled. Completed and cancelled fulfillments are terminal. The server validates the transition and updates inventory and parent order state atomically. After commit, a best-effort email notifies the customer of the vendor portion status change. Email failure does not fail the status update.',
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
        '409': {
          description:
            'INVALID_ORDER_STATUS_TRANSITION or CANCELLATION_ALREADY_RECORDED. An identical saved vendor cancellation returns 200 without repeating stock or email effects.',
        },
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
                    cancellation: null,
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
            },
          },
        },
      },
    },
  },
};
