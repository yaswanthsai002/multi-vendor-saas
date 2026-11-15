export const healthTags = [
  {
    name: 'System',
    description: 'System health and diagnostics',
  },
];

export const healthSchemas = {
  HealthCheck: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['ok', 'failed'],
        example: 'ok',
      },
      latencyMs: {
        type: 'number',
        description: 'Dependency health check latency in milliseconds.',
        example: 3,
      },
    },
    required: ['status', 'latencyMs'],
  },
  LivenessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['ok'],
        example: 'ok',
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2026-10-07T06:20:00.000Z',
      },
      uptime: {
        type: 'number',
        description: 'API process uptime in seconds.',
        example: 3842,
      },
    },
    required: ['status', 'timestamp', 'uptime'],
  },
  ReadinessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['ok', 'unavailable'],
        example: 'ok',
      },
      checks: {
        type: 'object',
        properties: {
          database: {
            $ref: '#/components/schemas/HealthCheck',
          },
          redis: {
            $ref: '#/components/schemas/HealthCheck',
          },
        },
        required: ['database', 'redis'],
      },
      timestamp: {
        type: 'string',
        format: 'date-time',
        example: '2026-10-07T06:20:00.000Z',
      },
      uptime: {
        type: 'number',
        description: 'API process uptime in seconds.',
        example: 3842,
      },
    },
    required: ['status', 'checks', 'timestamp', 'uptime'],
  },
};

export const healthPaths = {
  '/api/health/live': {
    get: {
      tags: ['System'],
      summary: 'Liveness health check',
      description:
        'Checks whether the API server is alive and able to handle HTTP requests. External dependencies are not checked.',
      responses: {
        '200': {
          description: 'API server is alive.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LivenessResponse',
              },
            },
          },
        },
      },
    },
  },
  '/api/health/ready': {
    get: {
      tags: ['System'],
      summary: 'Readiness health check',
      description:
        'Checks whether the API server is ready to handle requests by verifying required dependencies such as PostgreSQL and Redis.',
      responses: {
        '200': {
          description: 'API server and all required dependencies are healthy.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ReadinessResponse',
              },
            },
          },
        },
        '503': {
          description:
            'API server is running but one or more required dependencies are unavailable.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ReadinessResponse',
              },
            },
          },
        },
      },
    },
  },
};
