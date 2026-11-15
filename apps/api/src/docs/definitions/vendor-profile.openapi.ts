export const vendorProfileTags = [
  {
    name: 'Vendor Profile',
    description: 'Vendor store profile and owner management endpoints',
  },
];

export const vendorProfileSchemas = {
  VendorProfile: {
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
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
      user: {
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
          emailVerifiedAt: {
            anyOf: [
              {
                type: 'null',
              },
              {
                type: 'string',
                format: 'date-time',
              },
            ],
          },
        },
        required: ['userId', 'fullName', 'email', 'roles', 'emailVerifiedAt'],
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
      'createdAt',
      'updatedAt',
      'user',
    ],
  },
  UpdateVendorProfileInput: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      tagline: {
        anyOf: [
          {
            type: 'string',
            maxLength: 150,
          },
          {
            type: 'null',
          },
        ],
      },
      description: {
        anyOf: [
          {
            type: 'string',
            maxLength: 1000,
          },
          {
            type: 'null',
          },
        ],
      },
      logoUrl: {
        anyOf: [
          {
            type: 'string',
            format: 'uri',
          },
          {
            type: 'null',
          },
        ],
      },
      bannerUrl: {
        anyOf: [
          {
            type: 'string',
            format: 'uri',
          },
          {
            type: 'null',
          },
        ],
      },
      fullName: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
    },
    anyOf: [
      {
        required: ['name'],
      },
      {
        required: ['tagline'],
      },
      {
        required: ['description'],
      },
      {
        required: ['logoUrl'],
      },
      {
        required: ['bannerUrl'],
      },
      {
        required: ['fullName'],
      },
    ],
  },
};

export const vendorProfilePaths = {
  '/api/vendor/profile': {
    get: {
      tags: ['Vendor Profile'],
      summary: 'Get vendor store and owner profile',
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
                type: 'object',
                properties: {
                  profile: {
                    $ref: '#/components/schemas/VendorProfile',
                  },
                },
                required: ['profile'],
              },
              example: {
                profile: {
                  vendorId: '11111111-1111-4111-8111-111111111111',
                  name: 'Example',
                  slug: 'Example',
                  tagline: 'Example',
                  description: 'Example',
                  logoUrl: 'https://example.com/asset.webp',
                  bannerUrl: 'https://example.com/asset.webp',
                  status: 'active',
                  createdAt: '2026-11-15T10:00:00.000Z',
                  updatedAt: '2026-11-15T10:00:00.000Z',
                  user: {
                    userId: '11111111-1111-4111-8111-111111111111',
                    fullName: 'Example',
                    email: 'customer@example.com',
                    roles: ['customer'],
                    emailVerifiedAt: '2026-11-15T10:00:00.000Z',
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
      description:
        'Requires an authenticated, active vendor user and an active owned storefront. Returns the owned store and owner profile.',
    },
    patch: {
      tags: ['Vendor Profile'],
      summary: 'Update vendor store and owner profile',
      security: [
        {
          cookieAuth: [],
        },
      ],
      requestBody: {
        required: true,
        description: 'At least one field is required. Null clears nullable fields.',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateVendorProfileInput',
            },
            example: {
              name: 'Example Store',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Successful response.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                  },
                  profile: {
                    $ref: '#/components/schemas/VendorProfile',
                  },
                },
                required: ['message', 'profile'],
              },
              example: {
                message: 'Profile updated successfully.',
                profile: {
                  vendorId: '11111111-1111-4111-8111-111111111111',
                  name: 'Example',
                  slug: 'Example',
                  tagline: 'Example',
                  description: 'Example',
                  logoUrl: 'https://example.com/asset.webp',
                  bannerUrl: 'https://example.com/asset.webp',
                  status: 'active',
                  createdAt: '2026-11-15T10:00:00.000Z',
                  updatedAt: '2026-11-15T10:00:00.000Z',
                  user: {
                    userId: '11111111-1111-4111-8111-111111111111',
                    fullName: 'Example',
                    email: 'customer@example.com',
                    roles: ['customer'],
                    emailVerifiedAt: '2026-11-15T10:00:00.000Z',
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
      description:
        'Requires an authenticated, active vendor user and an active owned storefront. Supply at least one profile field. Store and owner updates are atomic.',
    },
  },
};
