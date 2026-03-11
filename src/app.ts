import express from 'express';
import routes from '@/routes/index.js';
import { apiRateLimit } from './lib/http/rateLimit.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { notFoundMiddleware } from './middleware/notFoundMiddleware.js';

const app = express();

app.disable('x-powered-by');

app.use(express.json());

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.use('/api', apiRateLimit);
app.use('/api', routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;