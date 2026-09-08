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
  },
};
