export const authTags = [
  {
    name: 'Auth',
    description: 'Authentication and session management',
  },
  {
    name: 'OTP & Verification',
    description: 'One-time passcode dispatch and verification',
  },
  {
    name: 'OAuth',
    description: 'Third-party OAuth 2.0 social authentication',
  },
];

export const authSchemas = {
  SignUpInput: {
    type: 'object',
    properties: {
      fullName: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
        example: 'Jane Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        pattern:
          "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
        example: 'jane@example.com',
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 128,
        example: 'StrongPassword123!',
      },
      confirmPassword: {
        type: 'string',
        example: 'StrongPassword123!',
      },
    },
    required: ['fullName', 'email', 'password', 'confirmPassword'],
  },
  SignInInput: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        pattern:
          "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
        example: 'jane@example.com',
      },
      password: {
        type: 'string',
        minLength: 1,
        example: 'StrongPassword123!',
      },
    },
    required: ['email', 'password'],
  },
  SendOtpInput: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        pattern:
          "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
        example: 'jane@example.com',
      },
      purpose: {
        default: 'email_verification',
        type: 'string',
        enum: ['signin', 'password_reset', 'email_verification'],
        example: 'email_verification',
      },
    },
    required: ['email'],
  },
  VerifyOtpInput: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email',
        pattern:
          "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$",
        example: 'jane@example.com',
      },
      otp: {
        type: 'string',
        minLength: 6,
        maxLength: 6,
        pattern: '^[0-9A-Z]+$',
        example: '123456',
      },
      purpose: {
        default: 'email_verification',
        type: 'string',
        enum: ['signin', 'password_reset', 'email_verification'],
        example: 'email_verification',
      },
    },
    required: ['otp'],
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
        example: 'NewSecretPass123!',
      },
    },
    required: ['newPassword', 'confirmNewPassword'],
  },
  VerificationStatusResponse: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
      },
      maskedEmail: {
        type: 'string',
      },
      purpose: {
        type: 'string',
      },
      remainingCooldown: {
        type: 'number',
      },
    },
    required: ['email', 'maskedEmail', 'purpose', 'remainingCooldown'],
  },
  UpdateCurrentUserProfileResponse: {
    type: 'object',
    properties: {
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
          status: {
            type: 'string',
            enum: ['active', 'suspended'],
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
          avatarUrl: {
            type: ['null', 'string'],
          },
        },
        required: [
          'userId',
          'fullName',
          'email',
          'roles',
          'status',
          'emailVerifiedAt',
          'avatarUrl',
        ],
      },
      message: {
        type: 'string',
      },
    },
    required: ['user', 'message'],
  },
  UpdateMeInput: {
    type: 'object',
    properties: {
      fullName: {
        type: 'string',
        minLength: 2,
        maxLength: 100,
      },
      avatarUrl: {
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
    },
    anyOf: [
      {
        required: ['fullName'],
      },
      {
        required: ['avatarUrl'],
      },
    ],
  },
  CreateAvatarUploadURLResponse: {
    type: 'object',
    properties: {
      uploadUrl: {
        type: 'string',
      },
      publicUrl: {
        type: 'string',
      },
      objectKey: {
        type: 'string',
      },
    },
    required: ['uploadUrl', 'publicUrl', 'objectKey'],
  },
  InitiateAvatarUploadInput: {
    type: 'object',
    properties: {
      fileName: {
        type: 'string',
        minLength: 1,
      },
      mimeType: {
        type: 'string',
        enum: ['image/jpeg', 'image/png', 'image/webp'],
      },
      fileSizeBytes: {
        type: 'number',
        exclusiveMinimum: 0,
        maximum: 5242880,
      },
    },
    required: ['fileName', 'mimeType', 'fileSizeBytes'],
  },
  ChangeCurrentUserPasswordResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
    },
    required: ['message'],
  },
  ChangePasswordInput: {
    type: 'object',
    properties: {
      currentPassword: {
        type: 'string',
        minLength: 1,
      },
      newPassword: {
        type: 'string',
        minLength: 8,
        maxLength: 128,
      },
      confirmNewPassword: {
        type: 'string',
      },
    },
    required: ['currentPassword', 'newPassword', 'confirmNewPassword'],
  },
  CurrentUserResponse: {
    type: 'object',
    properties: {
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
          status: {
            type: 'string',
            const: 'active',
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
          avatarUrl: {
            type: ['null', 'string'],
          },
        },
        required: [
          'userId',
          'fullName',
          'email',
          'roles',
          'status',
          'emailVerifiedAt',
          'avatarUrl',
        ],
      },
    },
    required: ['user'],
  },
  SignInResponse: {
    type: 'object',
    properties: {
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
          status: {
            type: 'string',
            const: 'active',
          },
          emailVerifiedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['userId', 'fullName', 'email', 'roles', 'status', 'emailVerifiedAt'],
      },
    },
    required: ['user'],
  },
  SendOtpResponse: {
    type: 'object',
    properties: {
      otp: {
        type: ['string'],
        description:
          'The current proof-of-concept implementation returns the generated OTP in JSON, including in production. This requires a security review before production use.',
        example: 'ABC123',
      },
      message: {
        type: 'string',
      },
      expiresIn: {
        type: 'number',
      },
      resendCooldown: {
        type: 'number',
      },
    },
    required: ['message', 'expiresIn', 'resendCooldown'],
  },
  VerifyOtpResponse: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
      },
      verified: {
        type: 'boolean',
      },
    },
    required: ['message', 'verified'],
  },
};

export const authPaths = {
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
            schema: {
              $ref: '#/components/schemas/SignUpInput',
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Account created successfully.',
          headers: {
            'Set-Cookie': {
              description:
                'Sets email_verification_pending_token when verification is pending. HttpOnly, SameSite=Lax, Path=/, Secure in production, with a 15-minute lifetime.',
              schema: {
                type: 'string',
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: {
                    $ref: '#/components/schemas/User',
                  },
                },
                required: ['user'],
              },
            },
          },
        },
        '400': {
          description: 'Validation error (invalid email, short password, mismatched passwords).',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '409': {
          description: 'Email already registered.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '429': {
          description: 'Rate limit exceeded (5 requests per 15 minutes).',
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
            schema: {
              $ref: '#/components/schemas/SignInInput',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Authentication successful.',
          headers: {
            'Set-Cookie': {
              description:
                'Sets auth_token. HttpOnly, SameSite=Lax, Path=/, Secure in production, with a two-hour lifetime.',
              schema: {
                type: 'string',
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SignInResponse',
              },
            },
          },
        },
        '400': {
          description: 'Invalid input payload.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '401': {
          description: 'Invalid email or password.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          description: 'Email verification required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '429': {
          description: 'Rate limit exceeded (5 requests per 15 minutes).',
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
                properties: {
                  message: {
                    type: 'string',
                    example: 'Signed out successfully',
                  },
                },
                required: ['message'],
              },
            },
          },
          headers: {
            'Set-Cookie': {
              description: 'Clears auth_token at Path=/.',
              schema: {
                type: 'string',
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
                $ref: '#/components/schemas/CurrentUserResponse',
              },
              example: {
                user: {
                  userId: '11111111-1111-4111-8111-111111111111',
                  fullName: 'Example',
                  email: 'customer@example.com',
                  roles: ['customer'],
                  status: 'active',
                  emailVerifiedAt: '2026-11-15T10:00:00.000Z',
                  avatarUrl: 'https://example.com/asset.webp',
                },
              },
            },
          },
        },
        '401': {
          description: 'Unauthenticated or invalid session token.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '403': {
          $ref: '#/components/responses/Error403',
        },
        '404': {
          description: 'User record not found.',
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
    patch: {
      tags: ['Auth'],
      summary: 'Update current user profile',
      description:
        'Requires a valid session. Updates only the authenticated user. Supply at least one of fullName or avatarUrl; null clears the avatar.',
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
                $ref: '#/components/schemas/UpdateCurrentUserProfileResponse',
              },
              example: {
                user: {
                  userId: '11111111-1111-4111-8111-111111111111',
                  fullName: 'Example',
                  email: 'customer@example.com',
                  roles: ['customer'],
                  status: 'active',
                  emailVerifiedAt: '2026-11-15T10:00:00.000Z',
                  avatarUrl: 'https://example.com/asset.webp',
                },
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
              $ref: '#/components/schemas/UpdateMeInput',
            },
            example: {
              fullName: 'Example',
              avatarUrl: 'https://example.com/asset.webp',
            },
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
        'Creates a six-character alphanumeric OTP, a pending-verification cookie valid for 15 minutes, and a 60-second resend cooldown. The current proof-of-concept implementation returns the OTP in JSON instead of delivering it out of band, including in production. Security review is required before production use.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SendOtpInput',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'OTP dispatched successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SendOtpResponse',
              },
            },
          },
        },
        '400': {
          description: 'Validation error.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'User not found (for password reset purpose).',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '409': {
          description: 'Email is already verified (for email verification purpose).',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '429': {
          description: 'Too many requests or OTP cooldown active.',
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
  '/api/auth/verify-otp': {
    post: {
      tags: ['OTP & Verification'],
      summary: 'Verify OTP code',
      description:
        'Validates the submitted OTP. A valid pending-verification cookie or x-verification-token header can supply omitted email and purpose fields. Explicit body fields take precedence. Without a recoverable email, validation fails. Purpose defaults to email_verification when neither body nor session supplies it. For password reset, success sets an HttpOnly reset_password_token cookie valid for ten minutes. JSON contains message and verified; reset tokens are not returned in JSON.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/VerifyOtpInput',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'OTP verified successfully.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/VerifyOtpResponse',
              },
            },
          },
          headers: {
            'Set-Cookie': {
              description:
                'Clears email_verification_pending_token. For password_reset purpose, sets reset_password_token with HttpOnly, SameSite=Lax, Path=/, Secure in production, and a ten-minute lifetime.',
              schema: {
                type: 'string',
              },
            },
          },
        },
        '400': {
          description: 'Invalid OTP, expired OTP, or maximum attempts exceeded.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '429': {
          description: 'Rate limit exceeded.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
      parameters: [
        {
          name: 'email_verification_pending_token',
          in: 'cookie',
          required: false,
          schema: {
            type: 'string',
          },
          description:
            'Pending email-verification session. Takes precedence over x-verification-token.',
        },
        {
          name: 'x-verification-token',
          in: 'header',
          required: false,
          schema: {
            type: 'string',
          },
          description: 'Alternative pending-verification session token.',
        },
      ],
    },
  },
  '/api/auth/verification-status': {
    get: {
      tags: ['OTP & Verification'],
      summary: 'Query email verification status',
      description:
        'Returns email, maskedEmail, purpose, and remaining resend cooldown. Token precedence is cookie, x-verification-token header, then token query parameter. If no valid session supplies the email, the email query parameter is used. Email fallback returns display/cooldown information; it does not create a session. When a token was supplied, the controller refreshes the pending cookie with that same token.',
      parameters: [
        {
          name: 'email_verification_pending_token',
          in: 'cookie',
          required: false,
          schema: {
            type: 'string',
          },
        },
        {
          name: 'x-verification-token',
          in: 'header',
          required: false,
          schema: {
            type: 'string',
          },
        },
        {
          name: 'token',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
          },
          description: 'Fallback pending-verification token. Prefer the HttpOnly cookie.',
        },
        {
          name: 'email',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            format: 'email',
          },
        },
        {
          name: 'purpose',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            default: 'email_verification',
          },
          description:
            'Expected values: signin, password_reset, or email_verification. The current fallback handler accepts the supplied string without enum validation.',
        },
      ],
      responses: {
        '200': {
          description: 'Verification status retrieved.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/VerificationStatusResponse',
              },
            },
          },
        },
        '400': {
          description: 'Missing email query param and pending token cookie.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'User not found.',
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
            schema: {
              $ref: '#/components/schemas/ResetPasswordInput',
            },
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
                  message: {
                    type: 'string',
                    example: 'Password reset successfully',
                  },
                },
                required: ['message'],
              },
            },
          },
          headers: {
            'Set-Cookie': {
              description: 'Clears reset_password_token at Path=/.',
              schema: {
                type: 'string',
              },
            },
          },
        },
        '400': {
          description: 'Invalid/expired reset token or passwords do not match.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'User not found.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '429': {
          description: 'Rate limit exceeded.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
      parameters: [
        {
          name: 'reset_password_token',
          in: 'cookie',
          required: false,
          schema: {
            type: 'string',
          },
          description:
            'Reset session set by OTP verification. Takes precedence over the resetToken body field.',
        },
      ],
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
          schema: {
            type: 'string',
            example: '/dashboard',
          },
        },
        {
          name: 'from',
          in: 'query',
          required: false,
          description: 'Initiating page path on frontend to return on failure (default: /signin)',
          schema: {
            type: 'string',
            example: '/signup',
          },
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
  '/api/auth/google/callback': {
    get: {
      tags: ['OAuth'],
      summary: 'Google OAuth callback handler',
      description:
        'Validates anti-CSRF state from Redis, exchanges authorization code for tokens, verifies Google ID token, performs implicit account linking, sets auth_token cookie, and redirects to frontend destination with auth_session_changed=1 after successful sign-in.',
      parameters: [
        {
          name: 'code',
          in: 'query',
          required: false,
          description: 'Authorization code returned by Google',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'state',
          in: 'query',
          required: false,
          description: 'Anti-CSRF state string',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'error',
          in: 'query',
          required: false,
          description: 'Error code from Google if user rejected consent',
          schema: {
            type: 'string',
            example: 'access_denied',
          },
        },
      ],
      responses: {
        '302': {
          description:
            'Redirects to frontend destination with ?auth_session_changed=1 on success, or origin page with ?error=... query param on failure.',
          headers: {
            Location: {
              schema: {
                type: 'string',
                example: 'http://localhost:3000/dashboard',
              },
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
  '/api/auth/avatar/upload-url': {
    post: {
      tags: ['Auth'],
      summary: 'Create avatar upload URL',
      description:
        'Requires a valid session. Generates a presigned PUT URL valid for 900 seconds. Supports JPEG, PNG, and WebP up to 5 MiB. Upload the file directly to that URL, then PATCH /api/auth/me with publicUrl as avatarUrl.',
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
                $ref: '#/components/schemas/CreateAvatarUploadURLResponse',
              },
              example: {
                uploadUrl: 'https://example.com/asset.webp',
                publicUrl: 'https://example.com/asset.webp',
                objectKey: 'Example',
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
        '500': {
          $ref: '#/components/responses/Error500',
        },
      },
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/InitiateAvatarUploadInput',
            },
            example: {
              fileName: 'Example',
              mimeType: 'image/jpeg',
              fileSizeBytes: 1,
            },
          },
        },
      },
    },
  },
  '/api/auth/change-password': {
    post: {
      tags: ['Auth'],
      summary: 'Change current user password',
      description:
        'Requires a valid session and an existing local password. currentPassword must be correct. newPassword and confirmNewPassword must match. Uses the same rate limiter as password reset.',
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
                $ref: '#/components/schemas/ChangeCurrentUserPasswordResponse',
              },
              example: {
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
        '429': {
          $ref: '#/components/responses/Error429',
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
              $ref: '#/components/schemas/ChangePasswordInput',
            },
            example: {
              currentPassword: 'Example-password-123',
              newPassword: 'Example-password-123',
              confirmNewPassword: 'Example-password-123',
            },
          },
        },
      },
    },
  },
};
