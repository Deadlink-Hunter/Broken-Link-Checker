# Broken Link Checker

A TypeScript Express application that checks if URLs are broken or not. Built with ES modules syntax, pnpm package manager, and follows the MVC pattern.

## Features

- ✅ Check if a single URL is broken
- ✅ Check multiple URLs at once (up to 10 URLs per request)
- ✅ Response time tracking
- ✅ Detailed error reporting
- ✅ TypeScript with ES modules
- ✅ CORS enabled
- ✅ Health check endpoint
- ✅ MVC architecture pattern
- ✅ Swagger/OpenAPI documentation

## Prerequisites

- Node.js (v16 or higher)
- pnpm package manager

## Installation

1. Install dependencies:

```bash
pnpm install
```

## Development

Start the development server with hot reload:

```bash
pnpm dev
```

The server will start on `http://localhost:3000`

## API Documentation

The API documentation is available at:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs/swagger.json`

## Production

Build the application:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## API Endpoints

### Health Check

```
GET /api/health
```

### Check Single URL

```
POST /api/check-url
Content-Type: application/json

{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "isBroken": false,
    "statusCode": 200,
    "responseTime": 245
  }
}
```

### Check Multiple URLs

```
POST /api/check-urls
Content-Type: application/json

{
  "urls": [
    "https://example.com",
    "https://google.com",
    "https://invalid-url-that-does-not-exist.com"
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "url": "https://example.com",
        "isBroken": false,
        "statusCode": 200,
        "responseTime": 245
      },
      {
        "url": "https://google.com",
        "isBroken": false,
        "statusCode": 200,
        "responseTime": 156
      },
      {
        "url": "https://invalid-url-that-does-not-exist.com",
        "isBroken": true,
        "error": "Request failed",
        "responseTime": 10000
      }
    ],
    "summary": {
      "total": 3,
      "broken": 1,
      "working": 2
    }
  }
}
```

## Error Responses

### Invalid URL Format

```json
{
  "success": false,
  "data": {
    "url": "invalid-url",
    "isBroken": true,
    "error": "Invalid URL format"
  }
}
```

### Missing URL

```json
{
  "success": false,
  "error": "URL is required"
}
```

### Too Many URLs

```json
{
  "success": false,
  "error": "Maximum 10 URLs allowed per request"
}
```

## Project Structure

```
src/
├── index.ts              # Main application entry point
├── config/
│   └── swagger.ts        # Swagger/OpenAPI configuration
├── controllers/
│   └── urlController.ts  # URL checking controller logic
├── routes/
│   └── urlRoutes.ts      # URL checking routes with Swagger docs
├── services/
│   └── urlService.ts     # URL checking service logic
└── constants/
    └── index.ts          # Application constants
```

## Architecture

The application follows the MVC (Model-View-Controller) pattern:

- **Controllers** (`src/controllers/`): Handle HTTP requests and responses, contain business logic
- **Routes** (`src/routes/`): Define API endpoints and connect them to controllers
- **Services** (`src/services/`): Contain core business logic and data processing
- **Models**: Represented by TypeScript interfaces and data structures
- **Config** (`src/config/`): Configuration files like Swagger documentation

## Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type safety and modern JavaScript features
- **ES Modules** - Modern import/export syntax
- **Axios** - HTTP client for URL checking
- **CORS** - Cross-origin resource sharing
- **Swagger/OpenAPI** - API documentation
- **pnpm** - Fast, disk space efficient package manager

## Configuration

The application uses the following default configuration:

- **Port**: 3000 (can be overridden with `PORT` environment variable)
- **Timeout**: 10 seconds for URL checks
- **Max Redirects**: 5
- **Max URLs per request**: 10

## Development Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build the TypeScript application
- `pnpm start` - Start the production server
- `pnpm test` - Run tests (placeholder)

## License

ISC
