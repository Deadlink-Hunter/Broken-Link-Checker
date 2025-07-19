import { Request, Response } from 'express';
import { checkUrl, checkMultipleUrls, UrlCheckResult } from '@service';
import {
  MAX_URLS_PER_REQUEST,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
} from '@constant';

export const checkSingleUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'URL is required',
      });
      return;
    }

    const result: UrlCheckResult = await checkUrl(url);

    res.status(200).json({
      success: true,
      data: result,
      message: result.isBroken
        ? 'URL check completed - URL is broken'
        : 'URL check completed - URL is working',
    });
  } catch (error: any) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Internal server error',
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
        error: 'URLs array is required',
      });
      return;
    }

    if (urls.length === 0) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'At least one URL is required',
      });
      return;
    }

    if (urls.length > MAX_URLS_PER_REQUEST) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: `Maximum ${MAX_URLS_PER_REQUEST} URLs allowed per request`,
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
      message: `URL check completed - ${summary.working} working, ${summary.broken} broken`,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
};

export const healthCheck = (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'URL Checker API is running',
    timestamp: new Date().toISOString(),
  });
};
