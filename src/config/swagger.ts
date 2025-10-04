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
        StorageStats: {
          type: 'object',
          properties: {
            totalChecks: {
              type: 'number',
              description: 'Total number of check requests (single + bulk)',
            },
            totalUrls: {
              type: 'number',
              description: 'Total number of URLs checked',
            },
            brokenUrls: {
              type: 'number',
              description: 'Number of broken URLs found',
            },
            workingUrls: {
              type: 'number',
              description: 'Number of working URLs found',
            },
            averageResponseTime: {
              type: 'number',
              description: 'Average response time in milliseconds',
            },
            lastCheck: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of the last check performed',
              nullable: true,
            },
            checksToday: {
              type: 'number',
              description: 'Number of URLs checked today',
            },
            checksThisWeek: {
              type: 'number',
              description: 'Number of URLs checked this week',
            },
            checksThisMonth: {
              type: 'number',
              description: 'Number of URLs checked this month',
            },
          },
        },
        UrlCheckRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the check record',
            },
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
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'When the check was performed',
            },
            metadata: {
              type: 'object',
              properties: {
                userAgent: {
                  type: 'string',
                  description: 'User agent of the request',
                },
                ip: {
                  type: 'string',
                  description: 'IP address of the client',
                },
                origin: {
                  type: 'string',
                  description: 'Origin of the request',
                },
              },
            },
          },
        },
        StatisticsResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: {
              $ref: '#/components/schemas/StorageStats',
            },
            message: {
              type: 'string',
            },
          },
        },
        RecentChecksResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: {
              type: 'object',
              properties: {
                checks: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/UrlCheckRecord',
                  },
                },
                count: {
                  type: 'number',
                  description: 'Number of checks returned',
                },
              },
            },
            message: {
              type: 'string',
            },
          },
        },
        DateRangeChecksResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: {
              type: 'object',
              properties: {
                checks: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/UrlCheckRecord',
                  },
                },
                count: {
                  type: 'number',
                  description: 'Number of checks returned',
                },
                dateRange: {
                  type: 'object',
                  properties: {
                    startDate: {
                      type: 'string',
                      format: 'date-time',
                    },
                    endDate: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const specs = swaggerJsdoc(options);
