export const openapiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Perigee REST API',
    version: '1.0.0',
    description:
      'API specification for Perigee multi-vendor SaaS platform. Covers Authentication, OTP verification, Password Reset, Google OAuth, and System Health endpoints.',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'System', description: 'System health and diagnostics' },
    { name: 'Auth', description: 'Authentication and session management' },
    { name: 'OTP & Verification', description: 'One-time passcode dispatch and verification' },
    { name: 'OAuth', description: 'Third-party OAuth 2.0 social authentication' },
    { name: 'Vendor Products', description: 'Vendor product catalog management endpoints' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth_token',
        description: 'HTTP-only session JWT cookie issued upon signin or OAuth completion.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            format: 'uuid',
            example: 'd3b07384-d113-4ec3-a6d8-9990886c9fd2',
          },
          fullName: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          roles: {
            type: 'array',
            items: { type: 'string', enum: ['customer', 'vendor', 'admin'] },
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
          code: { type: 'string', example: 'INVALID_CREDENTIALS' },
          error: { type: 'string', example: 'Invalid email or password.' },
          details: {
            type: 'object',
            description: 'Validation error tree details when applicable.',
          },
        },
        required: ['error'],
      },
      SignUpInput: {
        type: 'object',
        properties: {
          fullName: { type: 'string', minLength: 2, maxLength: 100, example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 8, maxLength: 128, example: 'StrongPassword123!' },
          confirmPassword: {
            type: 'string',
            minLength: 8,
            maxLength: 128,
            example: 'StrongPassword123!',
          },
        },
        required: ['fullName', 'email', 'password', 'confirmPassword'],
      },
      SignInInput: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 1, example: 'StrongPassword123!' },
        },
        required: ['email', 'password'],
      },
      SendOtpInput: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          purpose: {
            type: 'string',
            enum: ['signin', 'password_reset', 'email_verification'],
            default: 'email_verification',
            example: 'email_verification',
          },
        },
        required: ['email'],
      },
      VerifyOtpInput: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          otp: { type: 'string', minLength: 6, maxLength: 6, example: '123456' },
          purpose: {
            type: 'string',
            enum: ['signin', 'password_reset', 'email_verification'],
            default: 'email_verification',
            example: 'email_verification',
          },
        },
        required: ['email', 'otp'],
      },
      ResetPasswordInput: {
        type: 'object',
        properties: {
          resetToken: {
            type: 'string',
            description: 'Optional reset token if not supplied via reset_password_token cookie',
            example: 'v-reset-token-xyz',
          },
          newPassword: {
            type: 'string',
            minLength: 8,
            maxLength: 128,
            example: 'NewSecretPass123!',
          },
          confirmNewPassword: {
            type: 'string',
            minLength: 8,
            maxLength: 128,
            example: 'NewSecretPass123!',
          },
        },
        required: ['newPassword', 'confirmNewPassword'],
      },
      VerificationStatusResponse: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          isVerified: { type: 'boolean', example: false },
          emailVerifiedAt: { type: ['string', 'null'], format: 'date-time', example: null },
        },
        required: ['email', 'isVerified', 'emailVerifiedAt'],
      },
      VendorProduct: {
        type: 'object',
        properties: {
          productId: {
            type: 'string',
            format: 'uuid',
            example: '11111111-1111-4111-8111-111111111111',
          },
          vendorId: {
            type: 'string',
            format: 'uuid',
            example: '22222222-2222-4222-8222-222222222222',
          },
          name: { type: 'string', example: 'Ergonomic Mechanical Keyboard' },
          slug: { type: 'string', example: 'ergonomic-mechanical-keyboard' },
          description: {
            type: 'string',
            example: 'Premium hot-swappable mechanical keyboard with RGB backlighting.',
          },
          images: {
            type: 'array',
            items: { type: 'string' },
            example: ['https://example.com/img1.jpg'],
          },
          videos: { type: 'array', items: { type: 'string' }, example: [] },
          price: { type: 'string', example: '129.99' },
          stock: { type: 'integer', example: 50 },
          isSoftDeleted: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time', example: '2026-09-10T10:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-09-10T10:00:00.000Z' },
          categories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                categoryId: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                slug: { type: 'string' },
              },
            },
          },
        },
        required: [
          'productId',
          'vendorId',
          'name',
          'slug',
          'description',
          'images',
          'price',
          'stock',
          'isSoftDeleted',
          'createdAt',
          'updatedAt',
        ],
      },
      CreateProductInput: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 255,
            example: 'Ergonomic Mechanical Keyboard',
          },
          description: {
            type: 'string',
            minLength: 10,
            example: 'Premium hot-swappable mechanical keyboard with RGB backlighting.',
          },
          price: { type: 'string', pattern: '^\\d{1,10}(\\.\\d{1,2})?$', example: '129.99' },
          stock: { type: 'integer', minimum: 0, example: 50 },
          images: {
            type: 'array',
            items: { type: 'string', format: 'uri' },
            minItems: 1,
            example: ['https://example.com/img1.jpg'],
          },
          videos: { type: 'array', items: { type: 'string', format: 'uri' }, example: [] },
          categoryIds: { type: 'array', items: { type: 'string', format: 'uuid' }, example: [] },
          slug: {
            type: 'string',
            pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
            example: 'ergonomic-mechanical-keyboard',
          },
        },
        required: ['name', 'description', 'price', 'stock', 'images'],
      },
      UpdateProductInput: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 255,
            example: 'Ergonomic Mechanical Keyboard Pro',
          },
          description: {
            type: 'string',
            minLength: 10,
            example: 'Updated description for mechanical keyboard.',
          },
          price: { type: 'string', pattern: '^\\d{1,10}(\\.\\d{1,2})?$', example: '139.99' },
          stock: { type: 'integer', minimum: 0, example: 45 },
          images: { type: 'array', items: { type: 'string', format: 'uri' }, minItems: 1 },
          videos: { type: 'array', items: { type: 'string', format: 'uri' } },
          categoryIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' },
        },
      },
      ProductListResponse: {
        type: 'object',
        properties: {
          products: { type: 'array', items: { $ref: '#/components/schemas/VendorProduct' } },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 20 },
              total: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 1 },
            },
            required: ['page', 'limit', 'total', 'totalPages'],
          },
        },
        required: ['products', 'pagination'],
      },
      ProductDetailResponse: {
        type: 'object',
        properties: {
          product: { $ref: '#/components/schemas/VendorProduct' },
        },
        required: ['product'],
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'System health check',
        description: 'Returns operational health status of the API server.',
        responses: {
          '200': {
            description: 'API is running normally.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                  required: ['status'],
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new customer account',
        description:
          'Creates a new user record with customer role and sets email_verification_pending_token cookie for unverified accounts.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignUpInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Account created successfully.',
            headers: {
              'Set-Cookie': {
                schema: {
                  type: 'string',
                  example:
                    'email_verification_pending_token=jwt-token; Path=/; HttpOnly; SameSite=Lax',
                },
                description: 'Verification tracking cookie.',
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                  required: ['user'],
                },
              },
            },
          },
          '400': {
            description: 'Validation error (invalid email, short password, mismatched passwords).',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '409': {
            description: 'Email already registered.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '429': {
            description: 'Rate limit exceeded (5 requests per 15 minutes).',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/signin': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate with email and password',
        description:
          'Validates credentials, checks verified email status, and issues session auth_token cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignInInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authentication successful.',
            headers: {
              'Set-Cookie': {
                schema: {
                  type: 'string',
                  example: 'auth_token=jwt-token; Max-Age=7200; Path=/; HttpOnly; SameSite=Lax',
                },
                description: 'Session authentication cookie.',
              },
            },
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                  required: ['user'],
                },
              },
            },
          },
          '400': {
            description: 'Invalid input payload.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Invalid email or password.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Email verification required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '429': {
            description: 'Rate limit exceeded (5 requests per 15 minutes).',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/signout': {
      post: {
        tags: ['Auth'],
        summary: 'Sign out and invalidate session',
        description: 'Clears the session auth_token cookie.',
        responses: {
          '200': {
            description: 'Successfully signed out.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { message: { type: 'string', example: 'Signed out successfully' } },
                  required: ['message'],
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user profile',
        description: 'Resolves authenticated user from session auth_token cookie.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Profile resolved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                  required: ['user'],
                },
              },
            },
          },
          '401': {
            description: 'Unauthenticated or invalid session token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'User record not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/send-otp': {
      post: {
        tags: ['OTP & Verification'],
        summary: 'Send an OTP code to user email',
        description:
          'Generates and dispatches a 6-digit OTP code for email verification or password reset.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SendOtpInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP dispatched successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'OTP sent successfully' },
                    expiresIn: { type: 'integer', example: 300 },
                  },
                  required: ['message', 'expiresIn'],
                },
              },
            },
          },
          '400': {
            description: 'Validation error.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'User not found (for password reset purpose).',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '409': {
            description: 'Email is already verified (for email verification purpose).',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '429': {
            description: 'Too many requests or OTP cooldown active.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/verify-otp': {
      post: {
        tags: ['OTP & Verification'],
        summary: 'Verify OTP code',
        description:
          'Validates the submitted OTP. For password reset, issues a reset token cookie and body. For email verification, marks user email verified.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/VerifyOtpInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP verified successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'OTP verified successfully' },
                    resetToken: {
                      type: 'string',
                      description: 'Supplied when purpose is password_reset',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                  },
                  required: ['message'],
                },
              },
            },
          },
          '400': {
            description: 'Invalid OTP, expired OTP, or maximum attempts exceeded.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '429': {
            description: 'Rate limit exceeded.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/verification-status': {
      get: {
        tags: ['OTP & Verification'],
        summary: 'Query email verification status',
        description:
          'Checks verification status via email_verification_pending_token cookie or email query parameter.',
        parameters: [
          {
            name: 'email',
            in: 'query',
            required: false,
            description: 'Email address to query (optional if cookie is present)',
            schema: { type: 'string', format: 'email', example: 'jane@example.com' },
          },
        ],
        responses: {
          '200': {
            description: 'Verification status retrieved.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VerificationStatusResponse' },
              },
            },
          },
          '400': {
            description: 'Missing email query param and pending token cookie.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'User not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password with verified reset token',
        description:
          'Updates user password using the verified resetToken provided in cookie or body.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password reset successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Password reset successfully' },
                  },
                  required: ['message'],
                },
              },
            },
          },
          '400': {
            description: 'Invalid/expired reset token or passwords do not match.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'User not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '429': {
            description: 'Rate limit exceeded.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/google': {
      get: {
        tags: ['OAuth'],
        summary: 'Initiate Google OAuth 2.0 flow',
        description:
          'Generates anti-CSRF state, stores return parameters in Redis, and redirects user to Google account consent screen.',
        parameters: [
          {
            name: 'redirect',
            in: 'query',
            required: false,
            description: 'Destination path on frontend after successful login (default: /)',
            schema: { type: 'string', example: '/dashboard' },
          },
          {
            name: 'from',
            in: 'query',
            required: false,
            description: 'Initiating page path on frontend to return on failure (default: /signin)',
            schema: { type: 'string', example: '/signup' },
          },
        ],
        responses: {
          '302': {
            description: 'Redirect to Google accounts OAuth authorization URL.',
            headers: {
              Location: {
                schema: {
                  type: 'string',
                  example: 'https://accounts.google.com/o/oauth2/v2/auth?...',
                },
                description: 'Google authorization URL',
              },
            },
          },
          '500': {
            description: 'Google client configuration missing.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/auth/google/callback': {
      get: {
        tags: ['OAuth'],
        summary: 'Google OAuth callback handler',
        description:
          'Validates anti-CSRF state from Redis, exchanges authorization code for tokens, verifies Google ID token, performs implicit account linking, sets auth_token cookie, and redirects to frontend destination.',
        parameters: [
          {
            name: 'code',
            in: 'query',
            required: false,
            description: 'Authorization code returned by Google',
            schema: { type: 'string' },
          },
          {
            name: 'state',
            in: 'query',
            required: false,
            description: 'Anti-CSRF state string',
            schema: { type: 'string' },
          },
          {
            name: 'error',
            in: 'query',
            required: false,
            description: 'Error code from Google if user rejected consent',
            schema: { type: 'string', example: 'access_denied' },
          },
        ],
        responses: {
          '302': {
            description:
              'Redirects to frontend destination (on success) or origin page with ?error=... query param (on failure).',
            headers: {
              Location: {
                schema: { type: 'string', example: 'http://localhost:3000/dashboard' },
              },
              'Set-Cookie': {
                schema: {
                  type: 'string',
                  example: 'auth_token=jwt-token; Max-Age=7200; Path=/; HttpOnly; SameSite=Lax',
                },
              },
            },
          },
        },
      },
    },
    '/api/vendor/products': {
      get: {
        tags: ['Vendor Products'],
        summary: 'List products owned by the authenticated vendor',
        description:
          'Returns a paginated list of active (non-soft-deleted) products belonging exclusively to the authenticated vendor.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            description: 'Number of items per page',
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Case-insensitive search query matching product name or description',
          },
          {
            name: 'categoryId',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'uuid' },
            description: 'Filter products by category UUID',
          },
          {
            name: 'sortBy',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['createdAt', 'price', 'name', 'stock'],
              default: 'createdAt',
            },
            description: 'Field to sort products by',
          },
          {
            name: 'sortOrder',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            description: 'Sort direction',
          },
        ],
        responses: {
          '200': {
            description: 'Product list retrieved successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductListResponse' },
              },
            },
          },
          '401': {
            description: 'Authentication required or invalid session.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description:
              'Forbidden: caller lacks vendor role or does not have an active vendor profile.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Vendor Products'],
        summary: 'Create a new product under the authenticated vendor',
        description:
          'Creates a new product with server-side vendorId assignment, automatic slug generation, and category association.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateProductInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Product created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Product created successfully.' },
                    product: { $ref: '#/components/schemas/VendorProduct' },
                  },
                  required: ['message', 'product'],
                },
              },
            },
          },
          '400': {
            description: 'Validation Error or invalid category ID.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Authentication required.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden: caller lacks vendor role or active profile.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/vendor/products/{productId}': {
      parameters: [
        {
          name: 'productId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'UUID of the product',
        },
      ],
      get: {
        tags: ['Vendor Products'],
        summary: 'Get a product by ID owned by the authenticated vendor',
        description:
          'Returns product details including linked categories. Returns 404 if product does not belong to vendor or is deleted.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Product details retrieved successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductDetailResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid UUID format.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Authentication required.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden: caller lacks vendor role or active profile.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Product not found, belongs to another vendor, or is soft-deleted.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Vendor Products'],
        summary: 'Update a product owned by the authenticated vendor',
        description:
          'Partially updates product fields and category associations. Rejects updates if product is soft-deleted or slug collides.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateProductInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Product updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Product updated successfully.' },
                    product: { $ref: '#/components/schemas/VendorProduct' },
                  },
                  required: ['message', 'product'],
                },
              },
            },
          },
          '400': {
            description: 'Validation Error or empty update body.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Authentication required.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Product not found or belongs to another vendor.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Slug collision with another product.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Vendor Products'],
        summary: 'Soft delete a product owned by the authenticated vendor',
        description:
          'Marks product as soft-deleted. Subsequent queries will return 404 while preserving historic order references.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Product deleted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Product deleted successfully.' },
                  },
                  required: ['message'],
                },
              },
            },
          },
          '400': {
            description: 'Invalid UUID format.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Authentication required.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Product not found, already deleted, or belongs to another vendor.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};
