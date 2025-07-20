export const HTTP_TIMEOUT = 10000;
export const MAX_REDIRECTS = 5;
export const MAX_URLS_PER_REQUEST = 10;
export const DEFAULT_PORT = 3000;
export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;


export const ERROR_MESSAGES = {
  URL_REQUIRED: 'URL is required',
  URLS_ARRAY_REQUIRED: 'URLs array is required',
  AT_LEAST_ONE_URL: 'At least one URL is required',
  MAX_URLS_EXCEEDED: (max: number) => `Maximum ${max} URLs allowed per request`,
  INTERNAL_SERVER_ERROR: 'Internal server error',
};

export const SUCCESS_MESSAGES = {
  SINGLE_CHECK_BROKEN: 'URL check completed - URL is broken',
  SINGLE_CHECK_WORKING: 'URL check completed - URL is working',
  MULTIPLE_CHECK_SUMMARY: (working: number, broken: number) =>
    `URL check completed - ${working} working, ${broken} broken`,
  HEALTH_CHECK: 'URL Checker API is running',
};