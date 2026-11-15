export const commonSchemas = {
  User: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        format: 'uuid',
        example: 'd3b07384-d113-4ec3-a6d8-9990886c9fd2',
      },
      fullName: {
        type: 'string',
        example: 'Jane Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'jane@example.com',
      },
      roles: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['customer', 'vendor', 'admin'],
        },
        example: ['customer'],
      },
      emailVerifiedAt: {
        type: ['string', 'null'],
        format: 'date-time',
        example: '2026-09-08T12:00:00.000Z',
      },
    },
    required: ['userId', 'fullName', 'email', 'roles', 'emailVerifiedAt'],
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        example: 'INVALID_CREDENTIALS',
      },
      error: {
        type: 'string',
        example: 'Invalid email or password.',
      },
      requestId: {
        type: 'string',
        format: 'uuid',
        description:
          'Request identifier returned by the global error handler and X-Request-Id header.',
      },
      details: {
        description: 'Validation error tree or operation-specific failure details when applicable.',
      },
    },
    required: ['error'],
  },
};

export const commonResponses = {
  Error400: {
    description: 'Request validation failed or the operation violates a business rule.',
    headers: {
      'X-Request-Id': {
        description: 'Identifier for this failed request.',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          code: 'VALIDATION_ERROR',
          error: 'Request validation failed or the operation violates a business rule.',
          requestId: '11111111-1111-4111-8111-111111111111',
        },
      },
    },
  },
  Error401: {
    description: 'Missing, invalid, or expired auth_token session cookie.',
    headers: {
      'X-Request-Id': {
        description: 'Identifier for this failed request.',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          code: 'UNAUTHORIZED',
          error: 'Missing, invalid, or expired auth_token session cookie.',
          requestId: '11111111-1111-4111-8111-111111111111',
        },
      },
    },
  },
  Error403: {
    description: 'The authenticated account lacks the required role or resource access.',
    headers: {
      'X-Request-Id': {
        description: 'Identifier for this failed request.',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          code: 'FORBIDDEN',
          error: 'The authenticated account lacks the required role or resource access.',
          requestId: '11111111-1111-4111-8111-111111111111',
        },
      },
    },
  },
  Error404: {
    description:
      'The requested resource does not exist or does not belong to the authenticated account.',
    headers: {
      'X-Request-Id': {
        description: 'Identifier for this failed request.',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          code: 'NOT_FOUND',
          error:
            'The requested resource does not exist or does not belong to the authenticated account.',
          requestId: '11111111-1111-4111-8111-111111111111',
        },
      },
    },
  },
  Error409: {
    description: 'The operation conflicts with current resource state.',
    headers: {
      'X-Request-Id': {
        description: 'Identifier for this failed request.',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          code: 'REQUEST_FAILED',
          error: 'The operation conflicts with current resource state.',
          requestId: '11111111-1111-4111-8111-111111111111',
        },
      },
    },
  },
  Error422: {
    description: 'The submitted data cannot be used for this operation.',
    headers: {
      'X-Request-Id': {
        description: 'Identifier for this failed request.',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          code: 'REQUEST_FAILED',
          error: 'The submitted data cannot be used for this operation.',
          requestId: '11111111-1111-4111-8111-111111111111',
        },
      },
    },
  },
  Error429: {
    description: 'Too many requests. Retry after the indicated delay.',
    headers: {
      'X-Request-Id': {
        description: 'Identifier for this failed request.',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
      'Retry-After': {
        description:
          'Seconds until the per-IP rate-limit window permits another attempt. The OTP resend cooldown can return 429 without this header.',
        schema: {
          type: 'integer',
          minimum: 0,
        },
      },
    },
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          code: 'REQUEST_FAILED',
          error: 'Too many requests. Retry after the indicated delay.',
          requestId: '11111111-1111-4111-8111-111111111111',
        },
      },
    },
  },
  Error500: {
    description: 'Unexpected server failure. Internal details are not exposed.',
    headers: {
      'X-Request-Id': {
        description: 'Identifier for this failed request.',
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/ErrorResponse',
        },
        example: {
          code: 'REQUEST_FAILED',
          error: 'Unexpected server failure. Internal details are not exposed.',
          requestId: '11111111-1111-4111-8111-111111111111',
        },
      },
    },
  },
};
