import express from 'express';
import session from 'express-session';
import cors from 'cors';
import morgan from 'morgan';
import OpenapiSpec from './openapi';
import AuthRouter from './services/auth';
import MoviesRouter from './services/movies';
import ReviewsRouter, { MovieReviewsRouter, UserReviewsRouter } from './services/reviews';
import UsersRouter from './services/users';
import swaggerUi from 'swagger-ui-express';
import { handleTokenExpiration } from './session';
import { sessionConfig } from './config';

const app = express();

// TODO(kantoniak): Don't log in prod
app.use(morgan('combined'));
app.use(cors());
app.use(session(sessionConfig));

// Custom middleware
app.use(handleTokenExpiration);

// Routes (handled in order of appearance)
app.use('/auth', AuthRouter);
app.use('/movies/:id/reviews', MovieReviewsRouter);
app.use('/movies', MoviesRouter);
app.use('/reviews', ReviewsRouter);
app.use('/users/:id/reviews', UserReviewsRouter);
app.use('/users', UsersRouter);

// OpenAPI support
var options = {
    swaggerOptions: {
        displayOperationId: true,
        displayRequestDuration: true,
        operationsSorter: 'alpha',
        tagsSorter: 'alpha'
    }
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(OpenapiSpec, options));
app.get('/openapi.json', (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(OpenapiSpec);
});

app.listen(8080, () => {
    console.log(`public-api started on port 8080!`);
});
