export const adminVendorsTags = [
  {
    name: 'Admin Vendors',
    description: 'Administrative vendor onboarding and management.',
  },
];

export const adminVendorsSchemas = {
  ListAdminVendorsResponse: {
    type: 'object',
    properties: {
      vendors: {
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
            tagline: {
              type: ['null', 'string'],
            },
            description: {
              type: ['null', 'string'],
            },
            logoUrl: {
              type: ['null', 'string'],
            },
            bannerUrl: {
              type: ['null', 'string'],
            },
            status: {
              type: 'string',
              enum: ['active', 'suspended', 'pending', 'rejected'],
            },
            suspensionReason: {
              type: ['null', 'string'],
            },
            isFeatured: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
            },
            productCount: {
              type: 'number',
            },
            owner: {
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
                    fullName: {
                      type: ['null', 'string'],
                    },
                    email: {
                      type: ['null', 'string'],
                    },
                    status: {
                      anyOf: [
                        {
                          type: 'null',
                        },
                        {
                          type: 'string',
                          const: 'active',
                        },
                        {
                          type: 'string',
                          const: 'suspended',
                        },
                      ],
                    },
                  },
                  required: ['userId', 'fullName', 'email', 'status'],
                },
              ],
            },
          },
          required: [
            'vendorId',
            'name',
            'slug',
            'tagline',
            'description',
            'logoUrl',
            'bannerUrl',
            'status',
            'suspensionReason',
            'isFeatured',
            'createdAt',
            'productCount',
            'owner',
          ],
        },
      },
      counts: {
        type: 'object',
        properties: {
          all: {
            type: 'number',
          },
          pending: {
            type: 'number',
          },
          active: {
            type: 'number',
          },
          suspended: {
            type: 'number',
          },
          rejected: {
            type: 'number',
          },
        },
        required: ['all', 'pending', 'active', 'suspended', 'rejected'],
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
    required: ['vendors', 'counts', 'pagination'],
  },
  GetAdminVendorDetailResponse: {
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
      tagline: {
        type: ['null', 'string'],
      },
      description: {
        type: ['null', 'string'],
      },
      logoUrl: {
        type: ['null', 'string'],
      },
      bannerUrl: {
        type: ['null', 'string'],
      },
      status: {
        type: 'string',
        enum: ['active', 'suspended', 'pending', 'rejected'],
      },
      suspensionReason: {
        type: ['null', 'string'],
      },
      isFeatured: {
        type: 'boolean',
      },
      createdAt: {
        type: 'string',
      },
      owner: {
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
              fullName: {
                type: 'string',
              },
              email: {
                type: 'string',
              },
              status: {
                type: 'string',
                enum: ['active', 'suspended'],
              },
            },
            required: ['userId', 'fullName', 'email', 'status'],
          },
        ],
      },
      totalProducts: {
        type: 'number',
      },
    },
    required: [
      'vendorId',
      'name',
      'slug',
      'tagline',
      'description',
      'logoUrl',
      'bannerUrl',
      'status',
      'suspensionReason',
      'isFeatured',
      'createdAt',
      'owner',
      'totalProducts',
    ],
  },
  UpdateVendorStatusResponse: {
    type: 'object',
    properties: {
      vendorId: {
        type: 'string',
        format: 'uuid',
      },
      status: {
        type: 'string',
        enum: ['active', 'suspended', 'pending', 'rejected'],
      },
      message: {
        type: 'string',
      },
    },
    required: ['vendorId', 'status', 'message'],
  },
  AdminUpdateVendorStatusInput: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['pending', 'active', 'suspended', 'rejected'],
      },
      reason: {
        type: 'string',
        maxLength: 500,
      },
    },
    required: ['status'],
    allOf: [
      {
        if: {
          properties: {
            status: {
              enum: ['suspended', 'rejected'],
            },
          },
        },
        then: {
          required: ['reason'],
          properties: {
            reason: {
              minLength: 3,
            },
          },
        },
      },
    ],
  },
  UpdateVendorFeaturedFlagResponse: {
    type: 'object',
    properties: {
      vendorId: {
        type: 'string',
        format: 'uuid',
      },
      isFeatured: {
        type: 'boolean',
      },
    },
    required: ['vendorId', 'isFeatured'],
  },
  AdminToggleVendorFeaturedInput: {
    type: 'object',
    properties: {
      isFeatured: {
        type: 'boolean',
      },
    },
    required: ['isFeatured'],
  },
  AdminOnboardVendorResponse: {
    type: 'object',
    properties: {
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
          description: {
            type: ['null', 'string'],
          },
          status: {
            type: 'string',
            enum: ['active', 'suspended', 'pending', 'rejected'],
          },
          isFeatured: {
            type: 'boolean',
          },
          createdAt: {
            type: 'string',
          },
        },
        required: ['vendorId', 'name', 'slug', 'description', 'status', 'isFeatured', 'createdAt'],
      },
      owner: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            format: 'uuid',
          },
          email: {
            type: 'string',
          },
          fullName: {
            type: 'string',
          },
        },
        required: ['userId', 'email', 'fullName'],
      },
      temporaryPassword: {
        type: ['string'],
      },
      isNewUser: {
        type: 'boolean',
      },
      message: {
        type: 'string',
      },
    },
    required: ['vendor', 'owner', 'isNewUser', 'message'],
  },
};

export const adminVendorsPaths = {
  '/api/admin/vendors': {
    post: {
      tags: ['Admin Vendors'],
      summary: 'Onboard and provision a new merchant storefront (admin only)',
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
                name: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 100,
                },
                description: {
                  type: 'string',
                  maxLength: 1000,
                },
                ownerEmail: {
                  type: 'string',
                  format: 'email',
                },
                ownerFullName: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 100,
                },
                password: {
                  type: 'string',
                  minLength: 8,
                  maxLength: 128,
                },
                isFeatured: {
                  type: 'boolean',
                  default: false,
                },
              },
              required: ['name', 'ownerEmail'],
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AdminOnboardVendorResponse',
              },
              example: {
                vendor: {
                  vendorId: '11111111-1111-4111-8111-111111111111',
                  name: 'Example',
                  slug: 'Example',
                  description: 'Example',
                  status: 'active',
                  isFeatured: true,
                  createdAt: 'Example',
                },
                owner: {
                  userId: '11111111-1111-4111-8111-111111111111',
                  email: 'customer@example.com',
                  fullName: 'Example',
                },
                temporaryPassword: 'Example-password-123',
                isNewUser: true,
                message: 'Example',
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
        },
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. Creates an active storefront. If no owner account exists and no password is supplied, the response includes a generated temporary password. Existing owner accounts are upgraded to the vendor role. The slug is generated server-side.',
    },
    get: {
      tags: ['Admin Vendors'],
      summary: 'List admin vendors',
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
            enum: ['all', 'pending', 'active', 'suspended', 'rejected'],
          },
          example: 'all',
        },
        {
          name: 'isFeatured',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['true', 'false'],
          },
          example: 'true',
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ListAdminVendorsResponse',
              },
              example: {
                vendors: [
                  {
                    vendorId: '11111111-1111-4111-8111-111111111111',
                    name: 'Example',
                    slug: 'Example',
                    tagline: 'Example',
                    description: 'Example',
                    logoUrl: 'https://example.com/asset.webp',
                    bannerUrl: 'https://example.com/asset.webp',
                    status: 'active',
                    suspensionReason: 'Example',
                    isFeatured: true,
                    createdAt: 'Example',
                    productCount: 1,
                    owner: {
                      userId: '11111111-1111-4111-8111-111111111111',
                      fullName: 'Example',
                      email: 'customer@example.com',
                      status: 'active',
                    },
                  },
                ],
                counts: {
                  all: 1,
                  pending: 1,
                  active: 1,
                  suspended: 1,
                  rejected: 1,
                },
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
  '/api/admin/vendors/{vendorId}': {
    get: {
      tags: ['Admin Vendors'],
      summary: 'Get admin vendor detail',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'vendorId',
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
                $ref: '#/components/schemas/GetAdminVendorDetailResponse',
              },
              example: {
                vendorId: '11111111-1111-4111-8111-111111111111',
                name: 'Example',
                slug: 'Example',
                tagline: 'Example',
                description: 'Example',
                logoUrl: 'https://example.com/asset.webp',
                bannerUrl: 'https://example.com/asset.webp',
                status: 'active',
                suspensionReason: 'Example',
                isFeatured: true,
                createdAt: 'Example',
                owner: {
                  userId: '11111111-1111-4111-8111-111111111111',
                  fullName: 'Example',
                  email: 'customer@example.com',
                  status: 'active',
                },
                totalProducts: 1,
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
  '/api/admin/vendors/{vendorId}/status': {
    patch: {
      tags: ['Admin Vendors'],
      summary: 'Update vendor status',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. A reason of at least three characters is required for suspended and rejected states.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'vendorId',
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
                $ref: '#/components/schemas/UpdateVendorStatusResponse',
              },
              example: {
                vendorId: '11111111-1111-4111-8111-111111111111',
                status: 'active',
                message: 'Example',
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
              $ref: '#/components/schemas/AdminUpdateVendorStatusInput',
            },
            example: {
              status: 'pending',
              reason: 'Example',
            },
          },
        },
      },
    },
  },
  '/api/admin/vendors/{vendorId}/feature': {
    patch: {
      tags: ['Admin Vendors'],
      summary: 'Update vendor featured flag',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'vendorId',
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
                $ref: '#/components/schemas/UpdateVendorFeaturedFlagResponse',
              },
              example: {
                vendorId: '11111111-1111-4111-8111-111111111111',
                isFeatured: true,
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
              $ref: '#/components/schemas/AdminToggleVendorFeaturedInput',
            },
            example: {
              isFeatured: true,
            },
          },
        },
      },
    },
  },
};
