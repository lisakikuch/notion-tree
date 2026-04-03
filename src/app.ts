import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from '@/routes/index.js';
import cookieParser from 'cookie-parser';
import { apiRateLimit } from '@/lib/http/rateLimit.js';
import { errorMiddleware } from '@/middleware/errorMiddleware.js';
import { notFoundMiddleware } from '@/middleware/notFoundMiddleware.js';

const app = express();

app.use(helmet());
app.disable('x-powered-by');

const allowedOrigins = [
    'http://localhost:5173',
    'https://notion-tree-ashen.vercel.app',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'combined'));

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.use('/api', apiRateLimit);
app.use('/api', routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;