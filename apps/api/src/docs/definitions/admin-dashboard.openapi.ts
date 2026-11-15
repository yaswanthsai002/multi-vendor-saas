export const adminDashboardTags = [
  {
    name: 'Admin Dashboard',
    description: 'Administrative metrics and dashboard reporting.',
  },
];

export const adminDashboardSchemas = {
  GetAdminDashboardMetricsResponse: {
    type: 'object',
    properties: {
      kpi: {
        type: 'object',
        properties: {
          totalCustomers: {
            type: 'number',
          },
          activeVendors: {
            type: 'number',
          },
          marketplaceProducts: {
            type: 'number',
          },
          totalOrders: {
            type: 'number',
          },
        },
        required: ['totalCustomers', 'activeVendors', 'marketplaceProducts', 'totalOrders'],
      },
      needsAttention: {
        type: 'object',
        properties: {
          pendingVendors: {
            type: 'number',
          },
        },
        required: ['pendingVendors'],
      },
      merchandising: {
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
    },
    required: ['kpi', 'needsAttention', 'merchandising'],
  },
  GetAdminDashboardPerformanceResponse: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
        },
        day: {
          type: 'string',
        },
        orders: {
          type: 'number',
        },
        gmv: {
          type: 'number',
        },
      },
      required: ['date', 'day', 'orders', 'gmv'],
    },
  },
  GetAdminDashboardTopProductsResponse: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        rank: {
          type: 'number',
        },
        productId: {
          type: 'string',
          format: 'uuid',
        },
        name: {
          type: 'string',
        },
        vendor: {
          type: 'string',
        },
        unitsSold: {
          type: 'number',
        },
        orders: {
          type: 'number',
        },
        imageUrl: {
          type: ['null', 'string'],
        },
      },
      required: ['rank', 'productId', 'name', 'vendor', 'unitsSold', 'orders', 'imageUrl'],
    },
  },
  GetAdminDashboardRecentOrdersResponse: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          format: 'uuid',
        },
        orderNumber: {
          type: 'string',
        },
        customer: {
          type: 'string',
        },
        vendors: {
          type: 'string',
        },
        items: {
          type: 'number',
        },
        amount: {
          type: 'number',
        },
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        },
        placedAt: {
          type: 'string',
        },
      },
      required: [
        'orderId',
        'orderNumber',
        'customer',
        'vendors',
        'items',
        'amount',
        'status',
        'placedAt',
      ],
    },
  },
};

export const adminDashboardPaths = {
  '/api/admin/dashboard/metrics': {
    get: {
      tags: ['Admin Dashboard'],
      summary: 'Get admin dashboard metrics',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session.',
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
                $ref: '#/components/schemas/GetAdminDashboardMetricsResponse',
              },
              example: {
                kpi: {
                  totalCustomers: 1,
                  activeVendors: 1,
                  marketplaceProducts: 1,
                  totalOrders: 1,
                },
                needsAttention: {
                  pendingVendors: 1,
                },
                merchandising: {
                  featuredProducts: 1,
                  featuredBrands: 1,
                  activeDeals: 1,
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
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
    },
  },
  '/api/admin/dashboard/performance': {
    get: {
      tags: ['Admin Dashboard'],
      summary: 'Get admin dashboard performance',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. Supports 7, 30, or 90 days. A supported days value takes precedence over period; otherwise period or seven days is used. GMV currently uses a fallback display estimate when the aggregate is zero.',
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
                $ref: '#/components/schemas/GetAdminDashboardPerformanceResponse',
              },
              example: [
                {
                  date: 'Example',
                  day: 'Example',
                  orders: 1,
                  gmv: 1,
                },
              ],
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
      parameters: [
        {
          name: 'days',
          in: 'query',
          schema: {
            type: 'integer',
          },
          description:
            '7, 30, or 90 selects the window. Other integers fall back to period or seven days.',
          example: 30,
        },
        {
          name: 'period',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['7d', '30d', '90d'],
          },
          example: '30d',
        },
      ],
    },
  },
  '/api/admin/dashboard/top-products': {
    get: {
      tags: ['Admin Dashboard'],
      summary: 'Get admin dashboard top products',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. Returns up to five published, non-deleted products. Units sold and order counts currently use display estimates.',
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
                $ref: '#/components/schemas/GetAdminDashboardTopProductsResponse',
              },
              example: [
                {
                  rank: 1,
                  productId: '11111111-1111-4111-8111-111111111111',
                  name: 'Example',
                  vendor: 'Example',
                  unitsSold: 1,
                  orders: 1,
                  imageUrl: 'https://example.com/asset.webp',
                },
              ],
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
  '/api/admin/dashboard/recent-orders': {
    get: {
      tags: ['Admin Dashboard'],
      summary: 'Get admin dashboard recent orders',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. Returns up to six recent orders. Vendor, item-count, and amount fields currently use fixed display values.',
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
                $ref: '#/components/schemas/GetAdminDashboardRecentOrdersResponse',
              },
              example: [
                {
                  orderId: '11111111-1111-4111-8111-111111111111',
                  orderNumber: 'Example',
                  customer: 'Example',
                  vendors: 'Example',
                  items: 1,
                  amount: 1,
                  status: 'pending',
                  placedAt: 'Example',
                },
              ],
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
