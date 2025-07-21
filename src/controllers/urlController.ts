import { Request, Response } from 'express';
import { checkUrl, checkMultipleUrls, UrlCheckResult } from '@service';
import {
  MAX_URLS_PER_REQUEST,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '@constant';

import { maxUrlsExceededMessage } from '@/utils/errors';

export const checkSingleUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGES.URL_REQUIRED,
      });
      return;
    }

    const result: UrlCheckResult = await checkUrl(url);

    res.status(200).json({
      success: true,
      data: result,
      message: result.isBroken
        ? SUCCESS_MESSAGES.SINGLE_URL_BROKEN
        : SUCCESS_MESSAGES.SINGLE_URL_WORKING,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

export const checkMultipleUrlsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls)) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGES.URLS_ARRAY_REQUIRED,
      });
      return;
    }

    if (urls.length === 0) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: ERROR_MESSAGES.AT_LEAST_ONE_URL,
      });
      return;
    }

    if (urls.length > MAX_URLS_PER_REQUEST) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: maxUrlsExceededMessage(MAX_URLS_PER_REQUEST),
      });
      return;
    }

    const results: UrlCheckResult[] = await checkMultipleUrls(urls);

    const summary = {
      total: results.length,
      broken: results.filter((r) => r.isBroken).length,
      working: results.filter((r) => !r.isBroken).length,
    };

    res.status(200).json({
      success: true,
      data: {
        results,
        summary,
      },
      message: SUCCESS_MESSAGES.MULTIPLE_URLS_RESULT(summary.working, summary.broken),
    });
  } catch (error: any) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

export const healthCheck = (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: SUCCESS_MESSAGES.API_HEALTHY,
    timestamp: new Date().toISOString(),
  });
};
