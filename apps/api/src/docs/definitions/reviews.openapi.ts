export const reviewsPaths = {
  '/api/products/{slug}/reviews': {
    get: {
      tags: ['Catalog'],
      summary: 'List product ratings and reviews',
      parameters: [
        {
          name: 'slug',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'Public product slug.',
        },
        {
          name: 'page',
          in: 'query',
          schema: {
            default: 1,
            type: 'integer',
            minimum: 1,
            maximum: 9007199254740991,
          },
          description: 'One-based results page.',
          required: false,
        },
        {
          name: 'limit',
          in: 'query',
          schema: {
            default: 3,
            type: 'integer',
            minimum: 1,
            maximum: 20,
          },
          description: 'Reviews per page, up to 20.',
          required: false,
        },
      ],
      responses: {
        '200': {
          description: 'Paginated reviews and complete rating aggregates.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ProductReviewsResponse',
              },
            },
          },
        },
        '400': {
          description: 'Invalid product slug or pagination parameters.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Product unavailable.',
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

export const reviewsSchemas = {
  ProductReviewsResponse: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            reviewId: {
              type: 'string',
              format: 'uuid',
            },
            authorName: {
              type: 'string',
            },
            authorAvatarUrl: {
              type: ['string', 'null'],
              description: 'Current profile photo, if present.',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            reviewText: {
              type: ['string', 'null'],
              maxLength: 2000,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: [
            'reviewId',
            'authorName',
            'authorAvatarUrl',
            'rating',
            'reviewText',
            'createdAt',
          ],
        },
      },
      pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 20,
          },
          total: {
            type: 'integer',
            minimum: 0,
          },
          totalPages: {
            type: 'integer',
            minimum: 0,
          },
          hasMore: {
            type: 'boolean',
          },
        },
        required: ['page', 'limit', 'total', 'totalPages', 'hasMore'],
      },
      averageRating: {
        type: ['number', 'null'],
        minimum: 1,
        maximum: 5,
      },
      ratingCount: {
        type: 'integer',
        minimum: 0,
      },
      distribution: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            count: {
              type: 'integer',
              minimum: 0,
            },
          },
          required: ['rating', 'count'],
        },
        minItems: 5,
        maxItems: 5,
      },
    },
    required: ['items', 'pagination', 'averageRating', 'ratingCount', 'distribution'],
  },
};
