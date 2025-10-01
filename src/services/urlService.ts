import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { HTTP_TIMEOUT, MAX_REDIRECTS } from '@constant';
import { storageService } from './storageService';
import { UrlCheckRecord, BulkCheckRecord } from '../types/storage';

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

export const checkUrl = async (
  url: string, 
  metadata?: { userAgent?: string; ip?: string; origin?: string }
): Promise<UrlCheckResult> => {
  const startTime = Date.now();

  try {
    if (!isValidUrl(url)) {
      const result = {
        url,
        isBroken: true,
        error: 'Invalid URL format',
      };

      // Store the result
      const record: UrlCheckRecord = {
        id: uuidv4(),
        ...result,
        timestamp: new Date(),
        metadata,
      };
      
      await storageService.saveSingleCheck(record);
      return result;
    }

    const response: AxiosResponse = await axios.get(url, {
      timeout: HTTP_TIMEOUT,
      validateStatus: (status) => status < 400,
      maxRedirects: MAX_REDIRECTS,
    });

    const responseTime = Date.now() - startTime;

    const result = {
      url,
      isBroken: false,
      statusCode: response.status,
      responseTime,
    };

    // Store the result
    const record: UrlCheckRecord = {
      id: uuidv4(),
      ...result,
      timestamp: new Date(),
      metadata,
    };
    
    await storageService.saveSingleCheck(record);
    return result;
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    const result = {
      url,
      isBroken: true,
      statusCode: error.response?.status,
      error: error.message || 'Request failed',
      responseTime,
    };

    // Store the result
    const record: UrlCheckRecord = {
      id: uuidv4(),
      ...result,
      timestamp: new Date(),
      metadata,
    };
    
    await storageService.saveSingleCheck(record);
    return result;
  }
};

export const checkMultipleUrls = async (
  urls: string[],
  metadata?: { userAgent?: string; ip?: string; origin?: string }
): Promise<UrlCheckResult[]> => {
  const promises = urls.map((url) => checkUrl(url, metadata));
  const results = await Promise.all(promises);

  // Store bulk check record
  const summary = {
    total: results.length,
    broken: results.filter(r => r.isBroken).length,
    working: results.filter(r => !r.isBroken).length,
  };

  const bulkRecord: BulkCheckRecord = {
    id: uuidv4(),
    urls,
    results: results.map(result => ({
      id: uuidv4(),
      ...result,
      timestamp: new Date(),
      metadata,
    })),
    summary,
    timestamp: new Date(),
    metadata,
  };

  await storageService.saveBulkCheck(bulkRecord);
  return results;
};
