import axios, { AxiosResponse } from 'axios';
import { HTTP_TIMEOUT, MAX_REDIRECTS } from '@constant';

export interface UrlCheckResult {
  url: string;
  isBroken: boolean;
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const checkUrl = async (url: string): Promise<UrlCheckResult> => {
  const startTime = Date.now();

  try {
    if (!isValidUrl(url)) {
      return {
        url,
        isBroken: true,
        error: 'Invalid URL format',
      };
    }

    const response: AxiosResponse = await axios.get(url, {
      timeout: HTTP_TIMEOUT,
      validateStatus: (status) => status < 400,
      maxRedirects: MAX_REDIRECTS,
    });

    const responseTime = Date.now() - startTime;

    return {
      url,
      isBroken: false,
      statusCode: response.status,
      responseTime,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    return {
      url,
      isBroken: true,
      statusCode: error.response?.status,
      error: error.message || 'Request failed',
      responseTime,
    };
  }
};

export const checkMultipleUrls = async (
  urls: string[]
): Promise<UrlCheckResult[]> => {
  const promises = urls.map((url) => checkUrl(url));
  return Promise.all(promises);
};
