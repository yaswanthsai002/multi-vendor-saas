export const adminUsersTags = [
  {
    name: 'Admin Users',
    description: 'Administrative user listing and status management.',
  },
];

export const adminUsersSchemas = {
  ListAdminUsersResponse: {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        items: {
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
            roles: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['customer', 'vendor', 'admin'],
              },
            },
            status: {
              type: 'string',
              enum: ['active', 'suspended'],
            },
            suspensionReason: {
              type: ['null', 'string'],
            },
            emailVerifiedAt: {
              type: ['null', 'string'],
            },
            createdAt: {
              type: 'string',
            },
            vendor: {
              anyOf: [
                {
                  type: 'null',
                },
                {
                  type: 'object',
                  properties: {
                    vendorId: {
                      type: 'string',
                      format: 'uuid',
                    },
                    name: {
                      type: ['null', 'string'],
                    },
                    slug: {
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
                        {
                          type: 'string',
                          const: 'pending',
                        },
                        {
                          type: 'string',
                          const: 'rejected',
                        },
                      ],
                    },
                    logoUrl: {
                      type: ['null', 'string'],
                    },
                    isFeatured: {
                      type: ['null', 'boolean'],
                    },
                  },
                  required: ['vendorId', 'name', 'slug', 'status', 'logoUrl', 'isFeatured'],
                },
              ],
            },
          },
          required: [
            'userId',
            'fullName',
            'email',
            'roles',
            'status',
            'suspensionReason',
            'emailVerifiedAt',
            'createdAt',
            'vendor',
          ],
        },
      },
      counts: {
        type: 'object',
        properties: {
          all: {
            type: 'number',
          },
          active: {
            type: 'number',
          },
          suspended: {
            type: 'number',
          },
        },
        required: ['all', 'active', 'suspended'],
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
    required: ['users', 'counts', 'pagination'],
  },
  UpdateUserStatusResponse: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
      },
      status: {
        type: 'string',
        enum: ['active', 'suspended'],
      },
      message: {
        type: 'string',
      },
    },
    required: ['userId', 'status', 'message'],
  },
  AdminUpdateUserStatusInput: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['active', 'suspended'],
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
              const: 'suspended',
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
};

export const adminUsersPaths = {
  '/api/admin/users': {
    get: {
      tags: ['Admin Users'],
      summary: 'List admin users',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. Lists customer, vendor, and admin accounts with independent summary counts.',
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
          name: 'role',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['customer', 'vendor', 'admin'],
          },
          example: 'customer',
        },
        {
          name: 'status',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
          },
          example: 'Example',
        },
      ],
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ListAdminUsersResponse',
              },
              example: {
                users: [
                  {
                    userId: '11111111-1111-4111-8111-111111111111',
                    fullName: 'Example',
                    email: 'customer@example.com',
                    roles: ['customer'],
                    status: 'active',
                    suspensionReason: 'Example',
                    emailVerifiedAt: 'customer@example.com',
                    createdAt: 'Example',
                    vendor: {
                      vendorId: '11111111-1111-4111-8111-111111111111',
                      name: 'Example',
                      slug: 'Example',
                      status: 'active',
                      logoUrl: 'https://example.com/asset.webp',
                      isFeatured: true,
                    },
                  },
                ],
                counts: {
                  all: 1,
                  active: 1,
                  suspended: 1,
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
  '/api/admin/users/{userId}/status': {
    patch: {
      tags: ['Admin Users'],
      summary: 'Update user status',
      description:
        'Requires an authenticated, non-suspended user with the admin role. Identity and authorization are resolved from the session. A suspension reason must contain at least three characters. The actor cannot update their own status. The last active administrator cannot be suspended.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'userId',
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
                $ref: '#/components/schemas/UpdateUserStatusResponse',
              },
              example: {
                userId: '11111111-1111-4111-8111-111111111111',
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
              $ref: '#/components/schemas/AdminUpdateUserStatusInput',
            },
            example: {
              status: 'active',
              reason: 'Example',
            },
          },
        },
      },
    },
  },
};
