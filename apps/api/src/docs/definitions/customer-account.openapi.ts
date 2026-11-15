export const customerAccountTags = [
  {
    name: 'Customer Account',
    description: 'Authenticated customer profile and address book',
  },
];

export const customerAccountSchemas = {
  CustomerAddress: {
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
        type: ['string', 'null'],
      },
      city: {
        type: 'string',
      },
      state: {
        type: 'string',
      },
      postalCode: {
        type: 'string',
        pattern: '^[1-9]\\d{5}$',
      },
      country: {
        type: 'string',
        enum: ['IN'],
      },
      isDefault: {
        type: 'boolean',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
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
      'createdAt',
      'updatedAt',
    ],
  },
  CustomerAddressInput: {
    type: 'object',
    properties: {
      recipientName: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      phone: {
        type: 'string',
        minLength: 7,
        maxLength: 20,
      },
      addressLine1: {
        type: 'string',
        minLength: 3,
        maxLength: 200,
      },
      addressLine2: {
        default: null,
        anyOf: [
          {
            type: 'string',
            maxLength: 200,
          },
          {
            type: 'null',
          },
        ],
      },
      city: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      state: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      postalCode: {
        type: 'string',
        pattern: '^[1-9]\\d{5}$',
      },
      country: {
        default: 'IN',
        type: 'string',
        const: 'IN',
      },
      isDefault: {
        default: false,
        type: 'boolean',
      },
    },
    required: ['recipientName', 'phone', 'addressLine1', 'city', 'state', 'postalCode'],
    additionalProperties: false,
  },
  CustomerAddressUpdateInput: {
    type: 'object',
    properties: {
      recipientName: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      phone: {
        type: 'string',
        minLength: 7,
        maxLength: 20,
      },
      addressLine1: {
        type: 'string',
        minLength: 3,
        maxLength: 200,
      },
      addressLine2: {
        anyOf: [
          {
            type: 'string',
            maxLength: 200,
          },
          {
            type: 'null',
          },
        ],
      },
      city: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      state: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      postalCode: {
        type: 'string',
        pattern: '^[1-9]\\d{5}$',
      },
      country: {
        type: 'string',
        const: 'IN',
      },
      isDefault: {
        type: 'boolean',
      },
    },
    additionalProperties: false,
  },
  CustomerAddressList: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CustomerAddress',
        },
      },
    },
    required: ['items'],
  },
};

export const customerAccountPaths = {
  '/api/customer/addresses': {
    get: {
      tags: ['Customer Account'],
      summary: 'List addresses for the authenticated account',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Addresses owned by the authenticated user.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CustomerAddressList',
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
    post: {
      tags: ['Customer Account'],
      summary: 'Add an address to the authenticated account',
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
              $ref: '#/components/schemas/CustomerAddressInput',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Address created.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  address: {
                    $ref: '#/components/schemas/CustomerAddress',
                  },
                },
                required: ['address'],
              },
            },
          },
        },
        '400': {
          description: 'Invalid address fields or PIN code not found in postal records.',
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
  '/api/customer/addresses/{addressId}': {
    parameters: [
      {
        name: 'addressId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    patch: {
      tags: ['Customer Account'],
      summary: 'Update an address owned by the authenticated account',
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
              $ref: '#/components/schemas/CustomerAddressUpdateInput',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Address updated.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  address: {
                    $ref: '#/components/schemas/CustomerAddress',
                  },
                },
                required: ['address'],
              },
            },
          },
        },
        '400': {
          description: 'Invalid address ID or fields.',
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
          description: 'Active account required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Address not found.',
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
    delete: {
      tags: ['Customer Account'],
      summary: 'Delete an address owned by the authenticated account',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '204': {
          description: 'Address deleted.',
        },
        '400': {
          description: 'Invalid address ID.',
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
          description: 'Active account required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Address not found.',
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
};
