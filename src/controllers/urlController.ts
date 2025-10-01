import { Request, Response } from 'express';
import { checkUrl, checkMultipleUrls, UrlCheckResult } from '@service';
import { storageService } from '../services/storageService';
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
