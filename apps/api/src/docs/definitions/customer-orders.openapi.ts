export const customerOrdersTags = [
  {
    name: 'Customer Orders',
    description: 'Customer checkout, order placement, history, and cancellation.',
  },
];

const customerOrderBaseSchemas = {
  ReviewCustomerCheckoutResponse: {
    type: 'object',
    properties: {
      lines: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            imageUrl: {
              type: ['null', 'string'],
            },
            productId: {
              type: 'string',
              format: 'uuid',
            },
            quantity: {
              type: 'number',
            },
            name: {
              type: 'string',
            },
            stock: {
              type: 'number',
            },
            unitPrice: {
              type: 'string',
            },
            subtotal: {
              type: 'string',
            },
            available: {
              type: 'boolean',
            },
          },
          required: [
            'imageUrl',
            'productId',
            'quantity',
            'name',
            'stock',
            'unitPrice',
            'subtotal',
            'available',
          ],
        },
      },
      addresses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            addressId: {
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
            isDefault: {
              type: 'boolean',
            },
          },
          required: [
            'addressId',
            'recipientName',
            'phone',
            'addressLine1',
            'addressLine2',
            'city',
            'state',
            'postalCode',
            'country',
            'isDefault',
          ],
        },
      },
      addressId: {
        type: ['null', 'string'],
      },
      addressEligible: {
        type: 'boolean',
      },
      total: {
        type: 'string',
      },
    },
    required: ['lines', 'addresses', 'addressId', 'addressEligible', 'total'],
  },
  PlaceCustomerOrderResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            imageUrl: {
              type: ['null', 'string'],
            },
            orderItemId: {
              type: 'string',
              format: 'uuid',
            },
            productId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            productSlug: {
              type: ['null', 'string'],
            },
            quantity: {
              type: 'number',
            },
            unitPrice: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled', 'processing'],
            },
            subtotal: {
              type: 'string',
            },
          },
          required: [
            'imageUrl',
            'orderItemId',
            'productId',
            'name',
            'productSlug',
            'quantity',
            'unitPrice',
            'status',
            'subtotal',
          ],
        },
      },
      address: {
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
      total: {
        type: 'string',
      },
      fulfillments: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            vendorName: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'processing', 'completed', 'cancelled'] },
            orderItemIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
            completedAt: { type: ['string', 'null'], format: 'date-time' },
            completionSource: { enum: ['seller', null] },
            cancellation: { $ref: '#/components/schemas/OrderCancellation' },
          },
          required: [
            'vendorName',
            'status',
            'orderItemIds',
            'completedAt',
            'completionSource',
            'cancellation',
          ],
        },
      },
      canCancel: {
        type: 'boolean',
      },
      orderId: {
        type: 'string',
        format: 'uuid',
      },
      orderNumber: {
        type: 'string',
      },
      placedAt: {
        type: 'string',
        format: 'date-time',
      },
    },
    required: [
      'status',
      'items',
      'address',
      'total',
      'canCancel',
      'fulfillments',
      'orderId',
      'orderNumber',
      'placedAt',
    ],
  },
  PlaceCustomerOrderInput: {
    type: 'object',
    properties: {
      addressId: {
        type: 'string',
        format: 'uuid',
        pattern:
          '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
      },
      lines: {
        minItems: 1,
        maxItems: 200,
        type: 'array',
        items: {
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
              maximum: 2147483647,
            },
            expectedUnitPrice: {
              type: 'string',
              pattern: '^(0|[1-9]\\d{0,9})\\.\\d{2}$',
            },
          },
          required: ['productId', 'quantity', 'expectedUnitPrice'],
          additionalProperties: false,
        },
      },
    },
    required: ['addressId', 'lines'],
    additionalProperties: false,
  },
  ListCustomerOrdersResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  imageUrl: {
                    type: ['null', 'string'],
                  },
                  orderItemId: {
                    type: 'string',
                    format: 'uuid',
                  },
                  productId: {
                    type: 'string',
                    format: 'uuid',
                  },
                  name: {
                    type: 'string',
                  },
                  productSlug: {
                    type: ['null', 'string'],
                  },
                  quantity: {
                    type: 'number',
                  },
                  unitPrice: {
                    type: 'string',
                  },
                  status: {
                    type: 'string',
                    enum: ['pending', 'completed', 'cancelled', 'processing'],
                  },
                  subtotal: {
                    type: 'string',
                  },
                },
                required: [
                  'imageUrl',
                  'orderItemId',
                  'productId',
                  'name',
                  'productSlug',
                  'quantity',
                  'unitPrice',
                  'status',
                  'subtotal',
                ],
              },
            },
            address: {
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
            total: {
              type: 'string',
            },
            fulfillments: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  vendorName: { type: 'string' },
                  status: {
                    type: 'string',
                    enum: ['pending', 'processing', 'completed', 'cancelled'],
                  },
                  orderItemIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                  completedAt: { type: ['string', 'null'], format: 'date-time' },
                  completionSource: { enum: ['seller', null] },
                  cancellation: { $ref: '#/components/schemas/OrderCancellation' },
                },
                required: [
                  'vendorName',
                  'status',
                  'orderItemIds',
                  'completedAt',
                  'completionSource',
                  'cancellation',
                ],
              },
            },
            canCancel: {
              type: 'boolean',
            },
            orderId: {
              type: 'string',
              format: 'uuid',
            },
            orderNumber: {
              type: 'string',
            },
            placedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: [
            'status',
            'items',
            'address',
            'total',
            'canCancel',
            'fulfillments',
            'orderId',
            'orderNumber',
            'placedAt',
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
    required: ['items', 'pagination'],
  },
};

const reviewStateProperties = {
  orderItemId: { type: 'string', format: 'uuid' },
  reviewVersion: { type: 'integer', minimum: 0, maximum: 2147483647 },
  canReview: { type: 'boolean' },
  review: { oneOf: [{ type: 'null' }, { $ref: '#/components/schemas/CustomerReview' }] },
};

export const customerOrdersSchemas = {
  ...customerOrderBaseSchemas,
  CustomerReview: {
    type: 'object',
    additionalProperties: false,
    properties: {
      reviewId: { type: 'string', format: 'uuid' },
      rating: { type: 'integer', minimum: 1, maximum: 5 },
      reviewText: { type: ['string', 'null'], maxLength: 2000 },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
    required: ['reviewId', 'rating', 'reviewText', 'createdAt', 'updatedAt'],
  },
  CustomerReviewState: {
    type: 'object',
    additionalProperties: false,
    properties: reviewStateProperties,
    required: Object.keys(reviewStateProperties),
  },
  CustomerOrderDetail: {
    ...customerOrderBaseSchemas.PlaceCustomerOrderResponse,
    properties: {
      ...customerOrderBaseSchemas.PlaceCustomerOrderResponse.properties,
      items: {
        type: 'array',
        items: {
          ...customerOrderBaseSchemas.PlaceCustomerOrderResponse.properties.items.items,
          properties: {
            ...customerOrderBaseSchemas.PlaceCustomerOrderResponse.properties.items.items
              .properties,
            ...reviewStateProperties,
          },
          required: [
            ...customerOrderBaseSchemas.PlaceCustomerOrderResponse.properties.items.items.required,
            'reviewVersion',
            'canReview',
            'review',
          ],
        },
      },
    },
  },
};

function reviewOperation(deleting: boolean) {
  return {
    tags: ['Customer Orders'],
    summary: deleting ? 'Delete an order item review' : 'Create or replace an order item review',
    description:
      'Requires an authenticated active customer who owns the item. The vendor portion must be completed, regardless of product visibility. Identity and product references come from the server. Writes require the current item version. Deleting an absent review is a successful no-op even with an old version. Failed writes change no data. Text is trimmed, empty text becomes null, and omitted text clears previous feedback. Reject NUL, invalid Unicode and more than 2,000 code points.',
    security: [{ cookieAuth: [] }],
    parameters: ['orderId', 'orderItemId'].map((name) => ({
      name,
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    })),
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              expectedVersion: { type: 'integer', minimum: 0, maximum: 2147483647 },
              ...(deleting
                ? {}
                : {
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    reviewText: { type: ['string', 'null'], maxLength: 2000 },
                  }),
            },
            required: deleting ? ['expectedVersion'] : ['expectedVersion', 'rating'],
          },
          example: deleting
            ? { expectedVersion: 1 }
            : { expectedVersion: 0, rating: 5, reviewText: 'Works as described.' },
        },
      },
    },
    responses: {
      '200': {
        description:
          'Current review state. A successful write advances the version once; absent deletion keeps it unchanged.',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CustomerReviewState' },
            example: {
              orderItemId: '11111111-1111-4111-8111-111111111111',
              reviewVersion: 1,
              canReview: true,
              review: deleting
                ? null
                : {
                    reviewId: '22222222-2222-4222-8222-222222222222',
                    rating: 5,
                    reviewText: 'Works as described.',
                    createdAt: '2026-11-22T10:00:00.000Z',
                    updatedAt: '2026-11-22T10:00:00.000Z',
                  },
            },
          },
        },
      },
      '400': { $ref: '#/components/responses/Error400' },
      '401': { $ref: '#/components/responses/Error401' },
      '403': {
        description: 'ACCOUNT_INACTIVE or CUSTOMER_REQUIRED.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      '404': {
        description: 'ORDER_NOT_FOUND or ORDER_ITEM_NOT_FOUND, including inaccessible resources.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      '409': {
        description:
          'REVIEW_VERSION_CONFLICT, REVIEW_NOT_ELIGIBLE or REVIEW_VERSION_EXHAUSTED. Reload after a version conflict; do not retry automatically.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      '500': { $ref: '#/components/responses/Error500' },
    },
  };
}

export const customerOrdersPaths = {
  '/api/customer/orders/{orderId}/items/{orderItemId}/review': {
    put: reviewOperation(false),
    delete: reviewOperation(true),
  },
  '/api/customer/checkout/review': {
    get: {
      tags: ['Customer Orders'],
      summary: 'Review customer checkout',
      description:
        'Requires an authenticated active account. The customer role is not required for this review endpoint. Returns current cart prices, availability, owned delivery addresses, selected address eligibility, and total. Only Indian delivery addresses are eligible.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'addressId',
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
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ReviewCustomerCheckoutResponse',
              },
              example: {
                lines: [
                  {
                    imageUrl: 'https://example.com/asset.webp',
                    productId: '11111111-1111-4111-8111-111111111111',
                    quantity: 1,
                    name: 'Example',
                    stock: 1,
                    unitPrice: '99.00',
                    subtotal: '99.00',
                    available: true,
                  },
                ],
                addresses: [
                  {
                    addressId: '11111111-1111-4111-8111-111111111111',
                    recipientName: 'Example',
                    phone: '9876543210',
                    addressLine1: 'Example',
                    addressLine2: 'Example',
                    city: 'Example',
                    state: 'Example',
                    postalCode: '500001',
                    country: 'IN',
                    isDefault: true,
                  },
                ],
                addressId: '11111111-1111-4111-8111-111111111111',
                addressEligible: true,
                total: '99.00',
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
  '/api/customer/orders': {
    post: {
      tags: ['Customer Orders'],
      summary: 'Place customer order',
      description:
        'New orders trigger a best-effort customer confirmation email after commit; same-key replays do not resend it. Email failure does not fail the order. Requires an authenticated, active account with the customer role. Customer identity is derived from the session; order and address ownership are enforced server-side. Each product must occur once. Lines must match the current cart. The server checks expected prices and stock, creates order and vendor fulfillments, updates inventory, and clears the cart atomically. A repeated request with the same key and body returns the existing order with status 201.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'Idempotency-Key',
          in: 'header',
          required: true,
          description:
            'UUID unique to this checkout request. Reuse the same UUID and identical body to retry safely. Reuse with a different body returns 409 IDEMPOTENCY_CONFLICT.',
          schema: {
            type: 'string',
            format: 'uuid',
          },
          example: '11111111-1111-4111-8111-111111111111',
        },
      ],
      responses: {
        '201': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PlaceCustomerOrderResponse',
              },
              example: {
                status: 'Example',
                items: [
                  {
                    imageUrl: 'https://example.com/asset.webp',
                    orderItemId: '11111111-1111-4111-8111-111111111111',
                    productId: '11111111-1111-4111-8111-111111111111',
                    name: 'Example',
                    productSlug: 'Example',
                    quantity: 1,
                    unitPrice: '99.00',
                    status: 'pending',
                    subtotal: '99.00',
                  },
                ],
                address: {
                  recipientName: 'Example',
                  phone: '9876543210',
                  addressLine1: 'Example',
                  addressLine2: 'Example',
                  city: 'Example',
                  state: 'Example',
                  postalCode: '500001',
                  country: 'IN',
                },
                total: '99.00',
                canCancel: true,
                orderId: '11111111-1111-4111-8111-111111111111',
                orderNumber: 'Example',
                placedAt: '2026-11-15T10:00:00.000Z',
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
          $ref: '#/components/responses/Error409',
          description:
            'IDEMPOTENCY_CONFLICT for a reused key with another payload, CART_CHANGED for changed cart contents, or CHECKOUT_CONFLICT for changed prices or availability. CHECKOUT_CONFLICT details include affected productId, stock, unitPrice, and available fields.',
        },
        '422': {
          $ref: '#/components/responses/Error422',
          description:
            'INVALID_DELIVERY_ADDRESS: the address is not owned by the customer or its country is not IN.',
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
              $ref: '#/components/schemas/PlaceCustomerOrderInput',
            },
            example: {
              addressId: '11111111-1111-4111-8111-111111111111',
              lines: [
                {
                  productId: '11111111-1111-4111-8111-111111111111',
                  quantity: 1,
                  expectedUnitPrice: '99.00',
                },
              ],
            },
          },
        },
      },
    },
    get: {
      tags: ['Customer Orders'],
      summary: 'List customer orders',
      description:
        'Requires an authenticated, active account with the customer role. Customer identity is derived from the session; order and address ownership are enforced server-side. Dates use Asia/Kolkata calendar-day boundaries. orderedTo must not precede orderedFrom. Unknown query fields are rejected.',
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
            maximum: 100000,
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
            type: 'string',
            enum: [
              'Order placed',
              'In progress',
              'Partially cancelled',
              'Partially fulfilled',
              'Completed',
              'Cancelled',
            ],
          },
          example: 'Order placed',
        },
        {
          name: 'orderedFrom',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            pattern:
              '^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$',
          },
          example: '2026-11-15',
        },
        {
          name: 'orderedTo',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'date',
            pattern:
              '^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$',
          },
          example: '2026-11-15',
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ListCustomerOrdersResponse',
              },
              example: {
                items: [
                  {
                    status: 'Example',
                    items: [
                      {
                        imageUrl: 'https://example.com/asset.webp',
                        orderItemId: '11111111-1111-4111-8111-111111111111',
                        productId: '11111111-1111-4111-8111-111111111111',
                        name: 'Example',
                        productSlug: 'Example',
                        quantity: 1,
                        unitPrice: '99.00',
                        status: 'pending',
                        subtotal: '99.00',
                      },
                    ],
                    address: {
                      recipientName: 'Example',
                      phone: '9876543210',
                      addressLine1: 'Example',
                      addressLine2: 'Example',
                      city: 'Example',
                      state: 'Example',
                      postalCode: '500001',
                      country: 'IN',
                    },
                    total: '99.00',
                    canCancel: true,
                    orderId: '11111111-1111-4111-8111-111111111111',
                    orderNumber: 'Example',
                    placedAt: '2026-11-15T10:00:00.000Z',
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
  '/api/customer/orders/{orderId}': {
    get: {
      tags: ['Customer Orders'],
      summary: 'Get customer order detail',
      description:
        'Requires an authenticated, active account with the customer role. Customer identity is derived from the session; order and address ownership are enforced server-side.',
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
                $ref: '#/components/schemas/CustomerOrderDetail',
              },
              example: {
                status: 'Example',
                items: [
                  {
                    imageUrl: 'https://example.com/asset.webp',
                    orderItemId: '11111111-1111-4111-8111-111111111111',
                    productId: '11111111-1111-4111-8111-111111111111',
                    name: 'Example',
                    productSlug: 'Example',
                    quantity: 1,
                    unitPrice: '99.00',
                    status: 'pending',
                    subtotal: '99.00',
                    reviewVersion: 0,
                    canReview: false,
                    review: null,
                  },
                ],
                address: {
                  recipientName: 'Example',
                  phone: '9876543210',
                  addressLine1: 'Example',
                  addressLine2: 'Example',
                  city: 'Example',
                  state: 'Example',
                  postalCode: '500001',
                  country: 'IN',
                },
                total: '99.00',
                canCancel: true,
                orderId: '11111111-1111-4111-8111-111111111111',
                orderNumber: 'Example',
                placedAt: '2026-11-15T10:00:00.000Z',
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
  '/api/customer/orders/{orderId}/cancel': {
    post: {
      tags: ['Customer Orders'],
      summary: 'Cancel customer order',
      description:
        'Requires an authenticated, active account with the customer role. Customer identity is derived from the session; order and address ownership are enforced server-side. Cancels pending and processing vendor portions, restores stock, and recalculates parent status atomically. Cancellation is rejected if any vendor portion is completed. The body must be empty or an empty JSON object. Changed orders trigger a best-effort customer cancellation email after commit; repeated cancellations do not resend it. Email failure does not fail cancellation.',
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
                $ref: '#/components/schemas/PlaceCustomerOrderResponse',
              },
              example: {
                status: 'Example',
                items: [
                  {
                    imageUrl: 'https://example.com/asset.webp',
                    orderItemId: '11111111-1111-4111-8111-111111111111',
                    productId: '11111111-1111-4111-8111-111111111111',
                    name: 'Example',
                    productSlug: 'Example',
                    quantity: 1,
                    unitPrice: '99.00',
                    status: 'pending',
                    subtotal: '99.00',
                  },
                ],
                address: {
                  recipientName: 'Example',
                  phone: '9876543210',
                  addressLine1: 'Example',
                  addressLine2: 'Example',
                  city: 'Example',
                  state: 'Example',
                  postalCode: '500001',
                  country: 'IN',
                },
                total: '99.00',
                canCancel: true,
                orderId: '11111111-1111-4111-8111-111111111111',
                orderNumber: 'Example',
                placedAt: '2026-11-15T10:00:00.000Z',
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
        '409': {
          $ref: '#/components/responses/Error409',
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: false,
              maxProperties: 0,
            },
            example: {},
          },
        },
      },
    },
  },
};
