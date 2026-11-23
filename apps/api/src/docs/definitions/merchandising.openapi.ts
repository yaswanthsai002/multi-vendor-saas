export const merchandisingTags = [
  {
    name: 'Merchandising',
    description: 'Public campaigns and admin-managed homepage promotions',
  },
];

export const merchandisingSchemas = {
  Campaign: {
    type: 'object',
    properties: {
      campaignId: {
        type: 'string',
        format: 'uuid',
      },
      eyebrow: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      subtitle: {
        type: 'string',
      },
      imageUrl: {
        type: 'string',
      },
      mobileImageUrl: {
        type: ['string', 'null'],
      },
      ctaLabel: {
        type: 'string',
      },
      ctaHref: {
        type: 'string',
      },
      startsAt: {
        type: 'string',
        format: 'date-time',
      },
      endsAt: {
        type: 'string',
        format: 'date-time',
      },
      products: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CampaignProduct',
        },
      },
    },
    required: [
      'campaignId',
      'eyebrow',
      'title',
      'subtitle',
      'imageUrl',
      'ctaLabel',
      'ctaHref',
      'startsAt',
      'endsAt',
      'products',
    ],
  },
  CampaignProduct: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        format: 'uuid',
      },
      name: {
        type: 'string',
      },
      slug: {
        type: 'string',
      },
      regularPrice: {
        type: 'string',
      },
      dealPrice: {
        type: 'string',
      },
      mrp: {
        type: 'string',
      },
      stock: {
        type: 'integer',
      },
      imageUrl: {
        type: ['string', 'null'],
      },
      rating: {
        type: ['number', 'null'],
      },
      ratingCount: {
        type: 'integer',
      },
      vendor: {
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
        },
        required: ['vendorId', 'name', 'slug'],
      },
    },
    required: [
      'productId',
      'name',
      'slug',
      'regularPrice',
      'dealPrice',
      'mrp',
      'stock',
      'imageUrl',
      'rating',
      'ratingCount',
      'vendor',
    ],
  },
  AdminCampaignProduct: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        format: 'uuid',
      },
      name: {
        type: 'string',
      },
      price: {
        type: 'string',
      },
      dealPrice: {
        type: 'string',
      },
      imageUrl: {
        type: ['string', 'null'],
      },
      vendorName: {
        type: 'string',
      },
      unavailable: {
        type: 'boolean',
      },
    },
    required: ['productId', 'name', 'price', 'dealPrice'],
  },
  PromotionDraftPayload: {
    type: 'object',
    properties: {
      eyebrow: {
        type: 'string',
        maxLength: 60,
      },
      title: {
        type: 'string',
        maxLength: 120,
      },
      subtitle: {
        type: 'string',
        maxLength: 240,
      },
      imageMediaId: {
        type: ['string', 'null'],
        format: 'uuid',
      },
      mobileImageMediaId: {
        type: ['string', 'null'],
        format: 'uuid',
      },
      ctaLabel: {
        type: 'string',
        maxLength: 40,
      },
      ctaHref: {
        type: 'string',
        maxLength: 512,
      },
      startsAt: {
        type: 'string',
        maxLength: 32,
      },
      endsAt: {
        type: 'string',
        maxLength: 32,
      },
      position: {
        type: 'integer',
        minimum: 0,
        maximum: 1000,
      },
      products: {
        maxItems: 50,
        type: 'array',
        items: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              format: 'uuid',
              pattern:
                '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
            },
            dealPrice: {
              type: 'string',
              maxLength: 13,
            },
          },
          required: ['productId', 'dealPrice'],
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  AdminPromotionDraft: {
    type: 'object',
    properties: {
      draftId: {
        type: 'string',
        format: 'uuid',
      },
      campaignId: {
        type: ['string', 'null'],
        format: 'uuid',
      },
      payload: {
        $ref: '#/components/schemas/PromotionDraftPayload',
      },
      products: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/AdminCampaignProduct',
        },
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
    },
    required: ['draftId', 'campaignId', 'payload', 'updatedAt'],
  },
  AdminCampaign: {
    type: 'object',
    properties: {
      campaignId: {
        type: 'string',
        format: 'uuid',
      },
      eyebrow: {
        type: 'string',
      },
      title: {
        type: 'string',
      },
      subtitle: {
        type: 'string',
      },
      imageUrl: {
        type: 'string',
      },
      imageMediaId: {
        type: 'string',
        format: 'uuid',
      },
      mobileImageUrl: {
        type: ['string', 'null'],
      },
      mobileImageMediaId: {
        type: ['string', 'null'],
        format: 'uuid',
      },
      ctaLabel: {
        type: 'string',
      },
      ctaHref: {
        type: 'string',
      },
      startsAt: {
        type: 'string',
        format: 'date-time',
      },
      endsAt: {
        type: 'string',
        format: 'date-time',
      },
      position: {
        type: 'integer',
      },
      published: {
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
      products: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/AdminPublishedCampaignProduct',
        },
      },
    },
    required: [
      'campaignId',
      'eyebrow',
      'title',
      'subtitle',
      'imageUrl',
      'mobileImageUrl',
      'ctaLabel',
      'ctaHref',
      'startsAt',
      'endsAt',
      'position',
      'published',
      'createdAt',
      'updatedAt',
      'products',
    ],
  },
  CampaignListResponse: {
    type: 'object',
    properties: {
      items: {
        anyOf: [
          {
            type: 'array',
            items: false,
          },
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                published: {
                  type: 'boolean',
                },
                products: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      campaignId: {
                        type: 'string',
                        format: 'uuid',
                      },
                      productId: {
                        type: 'string',
                        format: 'uuid',
                      },
                      name: {
                        type: 'string',
                      },
                      price: {
                        type: 'string',
                      },
                      dealPrice: {
                        type: 'string',
                      },
                    },
                    required: ['campaignId', 'productId', 'name', 'price', 'dealPrice'],
                  },
                },
                campaignId: {
                  type: 'string',
                  format: 'uuid',
                },
                eyebrow: {
                  type: ['null', 'string'],
                },
                title: {
                  type: ['null', 'string'],
                },
                subtitle: {
                  type: ['null', 'string'],
                },
                imageUrl: {
                  type: ['null', 'string'],
                },
                imageMediaId: {
                  type: ['null', 'string'],
                  format: 'uuid',
                },
                mobileImageUrl: {
                  type: ['null', 'string'],
                },
                mobileImageMediaId: {
                  type: ['null', 'string'],
                  format: 'uuid',
                },
                ctaLabel: {
                  type: ['null', 'string'],
                },
                ctaHref: {
                  type: ['null', 'string'],
                },
                startsAt: {
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
                endsAt: {
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
                position: {
                  type: 'number',
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
                'published',
                'products',
                'campaignId',
                'eyebrow',
                'title',
                'subtitle',
                'imageUrl',
                'mobileImageUrl',
                'ctaLabel',
                'ctaHref',
                'startsAt',
                'endsAt',
                'position',
                'createdAt',
                'updatedAt',
              ],
            },
          },
        ],
      },
      drafts: {
        anyOf: [
          {
            type: 'array',
            items: false,
          },
          {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                draftId: {
                  type: 'string',
                  format: 'uuid',
                },
                campaignId: {
                  type: ['null', 'string'],
                },
                payload: {
                  type: 'object',
                  properties: {
                    eyebrow: {
                      type: ['string'],
                    },
                    title: {
                      type: ['string'],
                    },
                    subtitle: {
                      type: ['string'],
                    },
                    imageUrl: {
                      type: ['string'],
                    },
                    imageMediaId: {
                      type: ['null', 'string'],
                      format: 'uuid',
                    },
                    mobileImageUrl: {
                      type: ['string'],
                    },
                    mobileImageMediaId: {
                      type: ['null', 'string'],
                      format: 'uuid',
                    },
                    ctaLabel: {
                      type: ['string'],
                    },
                    ctaHref: {
                      type: ['string'],
                    },
                    startsAt: {
                      type: ['string'],
                    },
                    endsAt: {
                      type: ['string'],
                    },
                    position: {
                      type: ['number'],
                    },
                    products: {
                      anyOf: [
                        {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              productId: {
                                type: 'string',
                                format: 'uuid',
                              },
                              dealPrice: {
                                type: 'string',
                              },
                            },
                            required: ['productId', 'dealPrice'],
                          },
                        },
                      ],
                    },
                  },
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                },
              },
              required: ['draftId', 'campaignId', 'payload', 'updatedAt'],
            },
          },
        ],
      },
    },
    required: ['items', 'drafts'],
  },
  AdminPublishedCampaignProduct: {
    type: 'object',
    properties: {
      productId: {
        type: 'string',
        format: 'uuid',
      },
      name: {
        type: 'string',
      },
      price: {
        type: 'string',
      },
      dealPrice: {
        type: 'string',
      },
      imageUrl: {
        type: ['null', 'string'],
      },
      vendorName: {
        type: 'string',
      },
    },
    required: ['productId', 'name', 'price', 'dealPrice', 'imageUrl', 'vendorName'],
  },
};

export const merchandisingPaths = {
  '/api/merchandising/homepage': {
    get: {
      tags: ['Merchandising'],
      summary: 'Get active and upcoming homepage campaigns',
      responses: {
        '200': {
          description: 'Published campaigns with currently available products.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  active: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Campaign',
                    },
                  },
                  upcoming: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Campaign',
                    },
                  },
                },
                required: ['active', 'upcoming'],
              },
            },
          },
        },
      },
    },
  },
  '/api/admin/campaigns': {
    get: {
      tags: ['Merchandising'],
      summary: 'List campaigns and administrator-owned drafts',
      security: [
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          name: 'status',
          in: 'query',
          required: false,
          schema: {
            default: 'all',
            type: 'string',
            enum: ['all', 'draft', 'published'],
          },
        },
      ],
      responses: {
        '200': {
          description: 'Published campaigns and owned drafts.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CampaignListResponse',
              },
            },
          },
        },
        '400': {
          description: 'Invalid status filter.',
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
          description: 'Administrator role required.',
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
      tags: ['Merchandising'],
      summary: 'Create a promotion draft, optionally from an existing campaign',
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
              type: 'object',
              properties: {
                sourceCampaignId: {
                  type: 'string',
                  format: 'uuid',
                  pattern:
                    '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$',
                },
              },
              additionalProperties: false,
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Draft created or resumed.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['draft'],
                properties: {
                  draft: {
                    $ref: '#/components/schemas/AdminPromotionDraft',
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid campaign ID.',
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
          description: 'Administrator role required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Source campaign not found.',
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
  '/api/admin/campaigns/{campaignId}': {
    parameters: [
      {
        name: 'campaignId',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      },
    ],
    get: {
      tags: ['Merchandising'],
      summary: 'Get an owned promotion draft',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Draft fields and selected products.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  draft: {
                    $ref: '#/components/schemas/AdminPromotionDraft',
                  },
                },
                required: ['draft'],
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
          description: 'Administrator role required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Draft not found or not owned by this administrator.',
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
    put: {
      tags: ['Merchandising'],
      summary: 'Save an owned promotion draft',
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
              $ref: '#/components/schemas/PromotionDraftPayload',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Draft saved.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['draft'],
                properties: {
                  draft: {
                    $ref: '#/components/schemas/AdminPromotionDraft',
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid draft data.',
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
          description: 'Administrator role required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Draft not found or not owned by this administrator.',
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
      tags: ['Merchandising'],
      summary: 'Validate and publish an owned promotion draft',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'Published campaign.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['campaign'],
                properties: {
                  campaign: {
                    $ref: '#/components/schemas/AdminCampaign',
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Draft is incomplete or has invalid products, prices, or schedule.',
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
          description: 'Administrator role required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Draft not found or not owned by this administrator.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '409': {
          description: 'Product deal overlaps another campaign.',
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
      tags: ['Merchandising'],
      summary: 'Discard an owned promotion draft',
      security: [
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '204': {
          description: 'Draft discarded.',
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
          description: 'Administrator role required.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
        '404': {
          description: 'Draft not found or not owned by this administrator.',
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
