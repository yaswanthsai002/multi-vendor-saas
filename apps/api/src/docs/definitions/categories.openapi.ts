export const categoriesTags = [
  {
    name: 'Categories',
    description: 'Global category taxonomy and management',
  },
];

export const categoriesSchemas = {
  CategoryItem: {
    type: 'object',
    properties: {
      categoryId: {
        type: 'string',
        format: 'uuid',
        example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      },
      name: {
        type: 'string',
        example: 'Electronics',
      },
      slug: {
        type: 'string',
        example: 'electronics',
      },
      parentCategoryId: {
        type: ['string', 'null'],
        format: 'uuid',
        example: null,
      },
      imageUrl: {
        type: ['string', 'null'],
        example: null,
      },
      hasChildren: {
        type: 'boolean',
        example: true,
      },
    },
    required: ['categoryId', 'name', 'slug', 'parentCategoryId', 'hasChildren'],
  },
  CreateCategoryRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        example: 'Wireless Headphones',
      },
      parentCategoryId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
            pattern:
              '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
          },
          {
            type: 'null',
          },
        ],
        example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      },
      imageUrl: {
        anyOf: [
          {
            type: 'string',
            format: 'uri',
          },
          {
            type: 'null',
          },
        ],
        example: null,
      },
    },
    required: ['name'],
  },
  UpdateCategoryRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        example: 'Wireless Headphones',
      },
      parentCategoryId: {
        anyOf: [
          {
            type: 'string',
            format: 'uuid',
            pattern:
              '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
          },
          {
            type: 'null',
          },
        ],
        example: null,
      },
      imageUrl: {
        anyOf: [
          {
            type: 'string',
            format: 'uri',
          },
          {
            type: 'null',
          },
        ],
        example: null,
      },
    },
  },
};

export const categoriesPaths = {
  '/api/categories': {
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
          schema: {
            type: 'string',
            format: 'uuid',
            pattern:
              '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
          },
          description: 'UUID of parent category to fetch direct children for.',
        },
        {
          name: 'search',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
          },
          description: 'Filter categories by name substring match.',
        },
        {
          name: 'all',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['true', 'false'],
          },
          description: 'When "true", returns all categories across the entire taxonomy.',
        },
      ],
      responses: {
        '200': {
          description: 'List of categories matching filter.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/CategoryItem',
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid UUID format for parentCategoryId query.',
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
      tags: ['Categories'],
      summary: 'Create category (admin only)',
      description: 'Creates a category. Generates slug automatically. Requires admin role.',
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
              $ref: '#/components/schemas/CreateCategoryRequest',
            },
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
                  message: {
                    type: 'string',
                    example: 'Category created successfully.',
                  },
                  category: {
                    $ref: '#/components/schemas/CategoryItem',
                  },
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
          description: 'Admin role required.',
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
  '/api/categories/{categoryId}': {
    get: {
      tags: ['Categories'],
      summary: 'Get category by ID (public)',
      description: 'Returns single category with child status.',
      parameters: [
        {
          name: 'categoryId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Category UUID.',
        },
      ],
      responses: {
        '200': {
          description: 'Category details.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CategoryItem',
              },
            },
          },
        },
        '400': {
          description: 'Invalid UUID format for categoryId.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Category not found.',
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
      tags: ['Categories'],
      summary: 'Update category (admin only)',
      description:
        'Updates category name, image, or parent. Rejects updates that would create a circular hierarchy.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'categoryId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
          description: 'Category UUID.',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateCategoryRequest',
            },
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
                  message: {
                    type: 'string',
                    example: 'Category updated successfully.',
                  },
                  category: {
                    $ref: '#/components/schemas/CategoryItem',
                  },
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
          description: 'Admin role required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Category not found.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '409': {
          description: 'Conflict: category cycle detected.',
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
      tags: ['Categories'],
      summary: 'Delete category (admin only)',
      description:
        'Deletes a category. Rejects deletion if category has subcategories or is assigned to products.',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'categoryId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            format: 'uuid',
          },
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
                  message: {
                    type: 'string',
                    example: 'Category deleted successfully.',
                  },
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
          description: 'Admin role required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Category not found.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '409': {
          description: 'Conflict: category has subcategories or is in use by products.',
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
