import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Broken Link Checker API',
      version: '1.0.0',
      description:
        'A TypeScript Express API for checking if URLs are broken or not',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        UrlCheckResult: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL that was checked',
            },
            isBroken: {
              type: 'boolean',
              description: 'Whether the URL is broken or not',
            },
            statusCode: {
              type: 'number',
              description: 'HTTP status code of the response',
            },
            error: {
              type: 'string',
              description: 'Error message if the URL is broken',
            },
            responseTime: {
              type: 'number',
              description: 'Response time in milliseconds',
            },
          },
        },
        CheckUrlRequest: {
          type: 'object',
          required: ['url'],
          properties: {
            url: {
              type: 'string',
              description: 'The URL to check',
              example: 'https://example.com',
            },
          },
        },
        CheckUrlsRequest: {
          type: 'object',
          required: ['urls'],
          properties: {
            urls: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of URLs to check',
              example: ['https://example.com', 'https://google.com'],
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the request was successful',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
            error: {
              type: 'string',
              description: 'Error message if request failed',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const specs = swaggerJsdoc(options);
