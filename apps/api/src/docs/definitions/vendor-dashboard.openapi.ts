export const vendorDashboardTags = [
  {
    name: 'Vendor Dashboard',
    description: 'Vendor dashboard analytics and overview metrics',
  },
];

export const vendorDashboardSchemas = {
  VendorDashboardResponse: {
    type: 'object',
    properties: {
      metrics: {
        type: 'object',
        properties: {
          sales: {
            type: 'object',
            properties: {
              value: {
                type: 'number',
              },
            },
            required: ['value'],
          },
          orders: {
            type: 'object',
            properties: {
              value: {
                type: 'number',
              },
            },
            required: ['value'],
          },
          unitsSold: {
            type: 'object',
            properties: {
              value: {
                type: 'number',
              },
            },
            required: ['value'],
          },
          avgOrderValue: {
            type: 'object',
            properties: {
              value: {
                type: 'number',
              },
            },
            required: ['value'],
          },
        },
        required: ['sales', 'orders', 'unitsSold', 'avgOrderValue'],
      },
      chart: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
            },
            date: {
              type: 'string',
            },
            sales: {
              type: 'number',
            },
            orders: {
              type: 'number',
            },
          },
          required: ['label', 'date', 'sales', 'orders'],
        },
      },
      recentOrders: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            vendorOrderId: {
              type: 'string',
              format: 'uuid',
            },
            orderId: {
              type: 'string',
              format: 'uuid',
            },
            itemsCount: {
              type: 'number',
            },
            amount: {
              type: 'number',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled', 'processing'],
            },
            createdAt: {
              type: 'string',
            },
          },
          required: ['vendorOrderId', 'orderId', 'itemsCount', 'amount', 'status', 'createdAt'],
        },
      },
      topProducts: {
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
            category: {
              type: 'string',
            },
            thumbnailUrl: {
              type: ['string'],
            },
            unitsSold: {
              type: 'number',
            },
            sales: {
              type: 'number',
            },
            stock: {
              type: 'number',
            },
          },
          required: ['productId', 'name', 'category', 'unitsSold', 'sales', 'stock'],
        },
      },
    },
    required: ['metrics', 'chart', 'recentOrders', 'topProducts'],
  },
  VendorDashboardRecentOrdersResponse: {
    type: 'object',
    properties: {
      recentOrders: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            vendorOrderId: {
              type: 'string',
              format: 'uuid',
            },
            orderId: {
              type: 'string',
              format: 'uuid',
            },
            itemsCount: {
              type: 'number',
            },
            amount: {
              type: 'number',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'cancelled', 'processing'],
            },
            createdAt: {
              type: 'string',
            },
          },
          required: ['vendorOrderId', 'orderId', 'itemsCount', 'amount', 'status', 'createdAt'],
        },
      },
    },
    required: ['recentOrders'],
  },
};

export const vendorDashboardPaths = {
  '/api/vendor/dashboard': {
    get: {
      tags: ['Vendor Dashboard'],
      summary:
        'Get vendor dashboard overview analytics, sales chart data, recent orders, and top products',
      description:
        'Aggregates key vendor performance indicators (KPIs), time series chart data, recent order items, and top performing products for the specified timeframe.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'period',
          in: 'query',
          required: false,
          schema: {
            default: '7d',
            type: 'string',
            enum: ['7d', '30d', '90d'],
          },
          description: 'Timeframe filter for metrics calculation and chart grouping',
        },
      ],
      responses: {
        '200': {
          description: 'Aggregated vendor dashboard payload.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/VendorDashboardResponse',
              },
            },
          },
        },
        '400': {
          description: 'Validation error in query parameters.',
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
          description: 'Vendor role or active status required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Vendor profile not found.',
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
  '/api/vendor/dashboard/metrics': {
    get: {
      tags: ['Vendor Dashboard'],
      summary: 'Get vendor dashboard performance KPIs',
      description:
        'Returns aggregated store KPI metrics (sales, orders, units sold, avg order value) for the specified timeframe.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'period',
          in: 'query',
          required: false,
          schema: {
            default: '7d',
            type: 'string',
            enum: ['7d', '30d', '90d'],
          },
          description: 'Timeframe filter for metrics calculation',
        },
      ],
      responses: {
        '200': {
          description: 'Aggregated vendor metrics.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  metrics: {
                    type: 'object',
                    properties: {
                      sales: {
                        type: 'object',
                        properties: {
                          value: {
                            type: 'number',
                          },
                        },
                        required: ['value'],
                      },
                      orders: {
                        type: 'object',
                        properties: {
                          value: {
                            type: 'number',
                          },
                        },
                        required: ['value'],
                      },
                      unitsSold: {
                        type: 'object',
                        properties: {
                          value: {
                            type: 'number',
                          },
                        },
                        required: ['value'],
                      },
                      avgOrderValue: {
                        type: 'object',
                        properties: {
                          value: {
                            type: 'number',
                          },
                        },
                        required: ['value'],
                      },
                    },
                    required: ['sales', 'orders', 'unitsSold', 'avgOrderValue'],
                  },
                },
                required: ['metrics'],
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
      },
    },
  },
  '/api/vendor/dashboard/performance': {
    get: {
      tags: ['Vendor Dashboard'],
      summary: 'Get vendor dashboard performance chart data',
      description: 'Returns time series bucketed sales and orders for charting.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'period',
          in: 'query',
          required: false,
          schema: {
            default: '7d',
            type: 'string',
            enum: ['7d', '30d', '90d'],
          },
          description: 'Timeframe filter for chart grouping',
        },
      ],
      responses: {
        '200': {
          description: 'Time series chart buckets.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  chart: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        label: {
                          type: 'string',
                        },
                        date: {
                          type: 'string',
                        },
                        sales: {
                          type: 'number',
                        },
                        orders: {
                          type: 'number',
                        },
                      },
                      required: ['label', 'date', 'sales'],
                    },
                  },
                },
                required: ['chart'],
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
      },
    },
  },
  '/api/vendor/dashboard/recent-orders': {
    get: {
      tags: ['Vendor Dashboard'],
      summary: 'Get vendor dashboard recent orders',
      description: 'Returns the latest 5 orders for the vendor store.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Recent orders array.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/VendorDashboardRecentOrdersResponse',
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
      },
    },
  },
  '/api/vendor/dashboard/top-products': {
    get: {
      tags: ['Vendor Dashboard'],
      summary: 'Get vendor dashboard top products',
      description: 'Returns top performing products for the vendor store.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Top products array.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  topProducts: {
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
                        category: {
                          type: 'string',
                        },
                        thumbnailUrl: {
                          type: ['string', 'null'],
                        },
                        unitsSold: {
                          type: 'number',
                        },
                        sales: {
                          type: 'number',
                        },
                        stock: {
                          type: 'number',
                        },
                      },
                      required: ['productId', 'name', 'category', 'unitsSold', 'sales', 'stock'],
                    },
                  },
                },
                required: ['topProducts'],
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
      },
    },
  },
};
