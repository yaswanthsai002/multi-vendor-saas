export const locationsTags = [
  {
    name: 'Locations',
    description: 'Public Indian PIN code and postal area lookup',
  },
];

export const locationsPaths = {
  '/api/locations/pincodes/{postalCode}': {
    get: {
      tags: ['Locations'],
      summary: 'Look up Indian PIN code postal areas',
      parameters: [
        {
          name: 'postalCode',
          in: 'path',
          required: true,
          schema: { type: 'string', pattern: '^[1-9]\\d{5}$', example: '500072' },
        },
      ],
      responses: {
        '200': {
          description: 'Matching postal areas. An empty list means the PIN code was not found.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        area: { type: 'string', example: 'KPHB Colony' },
                        city: { type: 'string', example: 'Hyderabad' },
                        state: { type: 'string', example: 'Telangana' },
                      },
                      required: ['area', 'city', 'state'],
                    },
                  },
                },
                required: ['items'],
              },
            },
          },
        },
        '400': {
          description: 'Malformed Indian PIN code.',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        '502': {
          description: 'Postal lookup provider is unavailable.',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        '429': {
          description: 'PIN code lookup rate limit exceeded.',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
      },
    },
  },
};
