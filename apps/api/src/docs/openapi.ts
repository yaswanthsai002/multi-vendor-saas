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
    { name: 'Vendor Dashboard', description: 'Vendor dashboard analytics and overview metrics' },
    { name: 'Vendor Products', description: 'Vendor product catalog management endpoints' },
    { name: 'Vendor Media', description: 'Vendor media library management endpoints' },
    { name: 'Categories', description: 'Global category taxonomy and management' },
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
      CategoryItem: {
        type: 'object',
        properties: {
          categoryId: {
            type: 'string',
            format: 'uuid',
            example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          },
          name: { type: 'string', example: 'Electronics' },
          slug: { type: 'string', example: 'electronics' },
          parentCategoryId: {
            type: ['string', 'null'],
            format: 'uuid',
            example: null,
          },
          imageUrl: {
            type: ['string', 'null'],
            example: null,
          },
          hasChildren: { type: 'boolean', example: true },
        },
        required: ['categoryId', 'name', 'slug', 'parentCategoryId', 'hasChildren'],
      },
      CreateCategoryRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'Wireless Headphones' },
          parentCategoryId: {
            type: ['string', 'null'],
            format: 'uuid',
            example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
          },
          imageUrl: {
            type: ['string', 'null'],
            format: 'uri',
            example: null,
          },
        },
        required: ['name'],
      },
      UpdateCategoryRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'Wireless Headphones' },
          parentCategoryId: {
            type: ['string', 'null'],
            format: 'uuid',
            example: null,
          },
          imageUrl: {
            type: ['string', 'null'],
            format: 'uri',
            example: null,
          },
        },
      },
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
          productImageId: {
            type: ['string', 'null'],
            format: 'uuid',
            example: 'd3b07384-d113-4ec3-a6d8-9990886c9fd2',
          },
          primaryImage: {
            $ref: '#/components/schemas/MediaItem',
          },
          media: {
            type: 'array',
            items: { $ref: '#/components/schemas/MediaItem' },
          },
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
          productImageId: { type: ['string', 'null'], format: 'uuid', example: null },
          galleryMediaIds: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            example: [],
          },
          categoryIds: { type: 'array', items: { type: 'string', format: 'uuid' }, example: [] },
          slug: {
            type: 'string',
            pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
            example: 'ergonomic-mechanical-keyboard',
          },
        },
        required: ['name', 'description', 'price', 'stock'],
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
          productImageId: { type: ['string', 'null'], format: 'uuid' },
          galleryMediaIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
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
    '/api/vendor/dashboard': {
      get: {
        tags: ['Vendor Dashboard'],
        summary:
          'Get vendor dashboard overview analytics, sales chart data, recent orders, and top products',
        description:
          'Aggregates key vendor performance indicators (KPIs), time series chart data, recent order items, and top performing products for the specified timeframe.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'period',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['7d', '30d', '90d'], default: '7d' },
            description: 'Timeframe filter for metrics calculation and chart grouping',
          },
        ],
        responses: {
          '200': {
            description: 'Aggregated vendor dashboard payload.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    vendor: {
                      type: 'object',
                      properties: {
                        vendorId: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        logoUrl: { type: ['string', 'null'] },
                      },
                      required: ['vendorId', 'name', 'slug'],
                    },
                    metrics: {
                      type: 'object',
                      properties: {
                        sales: {
                          type: 'object',
                          properties: {
                            value: { type: 'number', example: 124500 },
                          },
                          required: ['value'],
                        },
                        orders: {
                          type: 'object',
                          properties: {
                            value: { type: 'number', example: 186 },
                          },
                          required: ['value'],
                        },
                        unitsSold: {
                          type: 'object',
                          properties: {
                            value: { type: 'number', example: 247 },
                          },
                          required: ['value'],
                        },
                        avgOrderValue: {
                          type: 'object',
                          properties: {
                            value: { type: 'number', example: 669 },
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
                          label: { type: 'string' },
                          date: { type: 'string' },
                          sales: { type: 'number' },
                        },
                        required: ['label', 'date', 'sales'],
                      },
                    },
                    recentOrders: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          vendorOrderId: { type: 'string', format: 'uuid' },
                          orderId: { type: 'string', format: 'uuid' },
                          orderNumber: { type: 'string' },
                          itemsCount: { type: 'number' },
                          amount: { type: 'number' },
                          status: {
                            type: 'string',
                            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
                          },
                          thumbnailUrl: { type: ['string', 'null'] },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                        required: [
                          'vendorOrderId',
                          'orderId',
                          'orderNumber',
                          'itemsCount',
                          'amount',
                          'status',
                          'createdAt',
                        ],
                      },
                    },
                    topProducts: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          productId: { type: 'string', format: 'uuid' },
                          name: { type: 'string' },
                          category: { type: 'string' },
                          thumbnailUrl: { type: ['string', 'null'] },
                          unitsSold: { type: 'number' },
                          sales: { type: 'number' },
                          stock: { type: 'number' },
                        },
                        required: ['productId', 'name', 'category', 'unitsSold', 'sales', 'stock'],
                      },
                    },
                  },
                  required: ['vendor', 'metrics', 'chart', 'recentOrders', 'topProducts'],
                },
              },
            },
          },
          '400': {
            description: 'Validation error in query parameters.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Authentication required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Vendor role or active status required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Vendor profile not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
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
    '/api/vendor/media': {
      post: {
        tags: ['Vendor Media'],
        summary: 'Upload a media asset (image or video)',
        description:
          'Uploads an image or video file for the authenticated vendor. Automatically processes image variants or extracts a video poster frame.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description:
                      'Image (max 10MB; jpeg, png, webp) or video (max 100MB; mp4, webm, quicktime)',
                  },
                },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Media uploaded and processed successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MediaUploadResponse' },
              },
            },
          },
          '400': {
            description:
              'Validation Error, missing file, unsupported MIME type, or file too large.',
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
          '500': {
            description: 'Internal server error during media processing or persistence.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      get: {
        tags: ['Vendor Media'],
        summary: 'List vendor media assets with pagination and filtering',
        description:
          'Returns a paginated list of media assets owned by the authenticated vendor, filterable by status, media type, and filename search.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['active', 'disabled', 'all'], default: 'active' },
            description: 'Filter assets by lifecycle status.',
          },
          {
            name: 'mediaType',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['image', 'video'] },
            description: 'Filter assets by media type.',
          },
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Case-insensitive partial filename search.',
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 1 },
            description: 'Page index (1-based).',
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', default: 20 },
            description: 'Number of assets per page (max 100).',
          },
        ],
        responses: {
          '200': {
            description: 'Paginated list of media assets.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MediaListResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid query parameters.',
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
    '/api/vendor/media/{mediaId}': {
      parameters: [
        {
          name: 'mediaId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'UUID of the media asset.',
        },
      ],
      get: {
        tags: ['Vendor Media'],
        summary: 'Get single media asset by ID',
        description:
          'Returns full metadata and resolved URLs for a specific media asset owned by the vendor.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Media asset retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    media: { $ref: '#/components/schemas/MediaItem' },
                  },
                  required: ['media'],
                },
              },
            },
          },
          '400': {
            description: 'Invalid mediaId UUID format.',
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
            description: 'Media asset not found or belongs to another vendor.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Vendor Media'],
        summary: 'Permanently delete a disabled, unreferenced media asset',
        description:
          'Deletes the database record and removes all physical files from disk. Only permitted when media is in disabled status and has zero product references.',
        security: [{ cookieAuth: [] }],
        responses: {
          '204': {
            description: 'Media asset permanently deleted.',
          },
          '400': {
            description: 'Media asset is not disabled.',
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
            description: 'Media asset not found or belongs to another vendor.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Media asset is in use by products and cannot be deleted.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/vendor/media/{mediaId}/disable': {
      parameters: [
        {
          name: 'mediaId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'UUID of the media asset.',
        },
      ],
      patch: {
        tags: ['Vendor Media'],
        summary: 'Disable a media asset and unlink product associations',
        description:
          'Marks media status as disabled, removes all ProductMedia references, and nullifies productImageId on affected products within a transaction.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Media disabled successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Media disabled successfully.' },
                    media: { $ref: '#/components/schemas/MediaItem' },
                  },
                  required: ['message', 'media'],
                },
              },
            },
          },
          '400': {
            description: 'Invalid UUID format or media is already disabled.',
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
            description: 'Media asset not found or belongs to another vendor.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/vendor/media/{mediaId}/enable': {
      parameters: [
        {
          name: 'mediaId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'UUID of the media asset.',
        },
      ],
      patch: {
        tags: ['Vendor Media'],
        summary: 'Re-activate a disabled media asset',
        description:
          'Transitions media status from disabled back to active, making it eligible again for product assignment.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Media enabled successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Media enabled successfully.' },
                    media: { $ref: '#/components/schemas/MediaItem' },
                  },
                  required: ['message', 'media'],
                },
              },
            },
          },
          '400': {
            description: 'Media is already active.',
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
            description: 'Media asset not found.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/vendor/media/bulk': {
      post: {
        tags: ['Vendor Media'],
        summary: 'Perform bulk action on vendor media assets',
        description:
          'Bulk enables, disables, or permanently deletes a list of vendor media assets.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  action: { type: 'string', enum: ['enable', 'disable', 'delete'] },
                  mediaIds: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                    minItems: 1,
                    maxItems: 100,
                  },
                },
                required: ['action', 'mediaIds'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Bulk action completed with summary report.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    action: { type: 'string', enum: ['enable', 'disable', 'delete'] },
                    total: { type: 'integer' },
                    processed: { type: 'integer' },
                    failedCount: { type: 'integer' },
                    message: { type: 'string' },
                  },
                  required: ['action', 'total', 'processed', 'failedCount', 'message'],
                },
              },
            },
          },
          '400': {
            description: 'Validation error.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories (public)',
        description:
          'Returns root categories by default (parentCategoryId is null). Accepts optional parentCategoryId to fetch direct children.',
        parameters: [
          {
            name: 'parentCategoryId',
            in: 'query',
            required: false,
            schema: { type: 'string', format: 'uuid' },
            description: 'UUID of parent category to fetch direct children for.',
          },
        ],
        responses: {
          '200': {
            description: 'List of categories matching filter.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CategoryItem' },
                },
              },
            },
          },
          '400': {
            description: 'Invalid UUID format for parentCategoryId query.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category (admin only)',
        description: 'Creates a category. Generates slug automatically. Requires admin role.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCategoryRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Category created successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Category created successfully.' },
                    category: { $ref: '#/components/schemas/CategoryItem' },
                  },
                  required: ['message', 'category'],
                },
              },
            },
          },
          '400': {
            description: 'Validation failed or specified parent category does not exist.',
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
            description: 'Admin role required.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/categories/{categoryId}': {
      get: {
        tags: ['Categories'],
        summary: 'Get category by ID (public)',
        description: 'Returns single category with child status.',
        parameters: [
          {
            name: 'categoryId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Category UUID.',
          },
        ],
        responses: {
          '200': {
            description: 'Category details.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CategoryItem' },
              },
            },
          },
          '400': {
            description: 'Invalid UUID format for categoryId.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Category not found.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Categories'],
        summary: 'Update category (admin only)',
        description:
          'Updates category name, image, or parent. Rejects updates that would create a circular hierarchy.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'categoryId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Category UUID.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCategoryRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Category updated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Category updated successfully.' },
                    category: { $ref: '#/components/schemas/CategoryItem' },
                  },
                  required: ['message', 'category'],
                },
              },
            },
          },
          '400': {
            description: 'Validation error or invalid parent category.',
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
            description: 'Admin role required.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Category not found.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Conflict: category cycle detected.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category (admin only)',
        description:
          'Deletes a category. Rejects deletion if category has subcategories or is assigned to products.',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'categoryId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Category UUID.',
          },
        ],
        responses: {
          '200': {
            description: 'Category deleted successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Category deleted successfully.' },
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
            description: 'Admin role required.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Category not found.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Conflict: category has subcategories or is in use by products.',
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
