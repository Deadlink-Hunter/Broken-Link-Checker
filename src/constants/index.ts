export const HTTP_TIMEOUT = 10000;
export const MAX_REDIRECTS = 5;
export const MAX_URLS_PER_REQUEST = 10;
export const DEFAULT_PORT = 3000;
export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;


export const INVALID_URL_FORMAT = 'Invalid URL format';
export const FAILED_REQUEST = 'Request failed';
export const URLS_ARRAY_REQUIRED = 'URLs array is required';
export const URL_WORKING = 'URL check completed - URL is working';
export const URL_BROKEN = 'URL check completed - URL is broken';
export const ONE_URL_REQUIRED = 'At least one URL is required';
export const URL_REQUIRED = 'URL is required';
export const MAXIMUM_URLS_ALLOWED = `Maximum ${MAX_URLS_PER_REQUEST} URLs allowed per request`;
export const INTERNAL_SERVER_ERROR = 'Internal server error';
export const HEALTH_CHECK_MESSAGE = 'URL Checker API is running';
export const URL_CHECK_COMPLETED = (working: number, broken: number) =>
    `URL check completed - ${working} working, ${broken} broken`;