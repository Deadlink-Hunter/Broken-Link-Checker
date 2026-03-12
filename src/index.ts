import express, { Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import urlRoutes from '@route';
import healthRoutes from '@healthRoutes';
import { specs } from '@config';
import {
  DEFAULT_PORT,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  TEST_ENV,
} from '@constant';

const app: Express = express();
const PORT = process.env.PORT || DEFAULT_PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Broken Link Checker API Documentation',
  }),
);

app.use('/api', urlRoutes);
app.use('/api', healthRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Broken Link Checker API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      'POST /api/check-url': 'Check if a single URL is broken',
      'POST /api/check-urls': 'Check multiple URLs at once',
      'GET /api/health': 'Health check endpoint',
    },
  });
});

app.use('*', (req, res) => {
  res.status(HTTP_STATUS_NOT_FOUND).json({
    success: false,
    error: 'Endpoint not found',
  });
});

app.use((err: any, res: express.Response) => {
  console.error('Error:', err);
  res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
    success: false,
    error: 'Internal server error',
  });
});

if (process.env.NODE_ENV !== TEST_ENV) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(
      `📖 API Documentation available at http://localhost:${PORT}/api-docs`,
    );
    console.log(
      `🏥 Health check available at http://localhost:${PORT}/api/health`,
    );
  });
}

export default app;
