import { Request, Response } from 'express';
import { checkUrl, checkMultipleUrls, UrlCheckResult } from '@service';
import { storageService } from '../services/storageService';
import {
    MAX_URLS_PER_REQUEST,
    HTTP_STATUS_BAD_REQUEST,
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    URL_REQUIRED,
    URL_BROKEN,
    URL_WORKING,
    INTERNAL_SERVER_ERROR,
    URLS_ARRAY_REQUIRED,
    ONE_URL_REQUIRED,
    MAXIMUM_URLS_ALLOWED,
    URL_CHECK_COMPLETED,
    HEALTH_CHECK_MESSAGE,
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
        error: URL_REQUIRED,
      });
      return;
    }

    // Extract metadata for storage
    const metadata = {
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      origin: req.get('Origin'),
    };

    const result: UrlCheckResult = await checkUrl(url, metadata);

    res.status(200).json({
      success: true,
      data: result,
      message: result.isBroken
        ? URL_BROKEN
        : URL_WORKING,
    });
  } catch (error: any) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: INTERNAL_SERVER_ERROR,
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
        error: URLS_ARRAY_REQUIRED,
      });
      return;
    }

    if (urls.length === 0) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: ONE_URL_REQUIRED,
      });
      return;
    }

    if (urls.length > MAX_URLS_PER_REQUEST) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: MAXIMUM_URLS_ALLOWED,
      });
      return;
    }

    // Extract metadata for storage
    const metadata = {
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      origin: req.get('Origin'),
    };

    const results: UrlCheckResult[] = await checkMultipleUrls(urls, metadata);

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
      message: URL_CHECK_COMPLETED(summary.working, summary.broken),
    });
  } catch (error: any) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  }
};

export const healthCheck = (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: HEALTH_CHECK_MESSAGE,
    timestamp: new Date().toISOString(),
  });
};

export const getStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await storageService.getStats();
    
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully',
    });
  } catch (error: any) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to retrieve statistics',
      message: error.message,
    });
  }
};

export const getRecentChecks = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (limit > 1000) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Limit cannot exceed 1000',
      });
      return;
    }

    const recentChecks = await storageService.getRecentChecks(limit);
    
    res.status(200).json({
      success: true,
      data: {
        checks: recentChecks,
        count: recentChecks.length,
      },
      message: 'Recent checks retrieved successfully',
    });
  } catch (error: any) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to retrieve recent checks',
      message: error.message,
    });
  }
};

export const getChecksByDateRange = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Both startDate and endDate are required',
      });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Invalid date format. Use ISO date format (YYYY-MM-DD)',
      });
      return;
    }

    if (start > end) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        error: 'Start date must be before end date',
      });
      return;
    }

    const checks = await storageService.getChecksByDateRange(start, end);
    
    res.status(200).json({
      success: true,
      data: {
        checks,
        count: checks.length,
        dateRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      },
      message: 'Checks retrieved successfully',
    });
  } catch (error: any) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Failed to retrieve checks by date range',
      message: error.message,
    });
  }
};
