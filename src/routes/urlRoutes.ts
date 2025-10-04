import { Router } from 'express';
import {
  checkSingleUrl,
  checkMultipleUrlsController,
  healthCheck,
  getStatistics,
  getRecentChecks,
  getChecksByDateRange,
} from '@controller';

const router: Router = Router();

/**
 * @swagger
 * /api/check-url:
 *   post:
 *     summary: Check if a single URL is broken
 *     description: Check if a single URL is accessible and working
 *     tags: [URL Checking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckUrlRequest'
 *     responses:
 *       200:
 *         description: URL check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UrlCheckResult'
 *       400:
 *         description: Bad request - URL is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: URL is required
 *       500:
 *         description: Internal server error
 */
router.post('/check-url', checkSingleUrl);

/**
 * @swagger
 * /api/check-urls:
 *   post:
 *     summary: Check multiple URLs at once
 *     description: Check if multiple URLs are accessible and working (max 10 URLs)
 *     tags: [URL Checking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckUrlsRequest'
 *     responses:
 *       200:
 *         description: URLs check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UrlCheckResult'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           description: Total number of URLs checked
 *                         broken:
 *                           type: number
 *                           description: Number of broken URLs
 *                         working:
 *                           type: number
 *                           description: Number of working URLs
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: URLs array is required
 *       500:
 *         description: Internal server error
 */
router.post('/check-urls', checkMultipleUrlsController);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get('/health', healthCheck);

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Get URL checking statistics
 *     description: Retrieve comprehensive statistics about URL checks including totals, broken vs working URLs, and time-based metrics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatisticsResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/statistics', getStatistics);

/**
 * @swagger
 * /api/recent-checks:
 *   get:
 *     summary: Get recent URL checks
 *     description: Retrieve the most recent URL checks with optional limit
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 50
 *         description: Maximum number of recent checks to retrieve
 *     responses:
 *       200:
 *         description: Recent checks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecentChecksResponse'
 *       400:
 *         description: Bad request - Invalid limit
 *       500:
 *         description: Internal server error
 */
router.get('/recent-checks', getRecentChecks);

/**
 * @swagger
 * /api/checks-by-date:
 *   get:
 *     summary: Get URL checks by date range
 *     description: Retrieve URL checks within a specific date range
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date in YYYY-MM-DD format
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date in YYYY-MM-DD format
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Checks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DateRangeChecksResponse'
 *       400:
 *         description: Bad request - Invalid or missing dates
 *       500:
 *         description: Internal server error
 */
router.get('/checks-by-date', getChecksByDateRange);

export default router;
