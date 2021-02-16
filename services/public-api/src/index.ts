import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import OpenApiSpec from './openapi';
import AuthRouter from './services/auth';
import MoviesRouter from './services/movies';
import RelationsRouter from './services/relations';
import ReviewsRouter, { MovieReviewsRouter, UserReviewsRouter } from './services/reviews';
import UsersRouter from './services/users';
import swaggerUi from 'swagger-ui-express';
import { corsConfig, NODE_ENV } from './config';
import { handleValidationErrors, sendBackHttp4xxOr500 } from './middleware';
import { redirectToDocs } from './utils';

const app = express();

if (NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}
app.use(cors(corsConfig));
app.use(cookieParser());

// Routes (handled in order of appearance)
const apiRouter = express.Router();
apiRouter.use('/auth', AuthRouter);
apiRouter.use('/movies/:id/reviews', MovieReviewsRouter);
apiRouter.use('/movies', MoviesRouter);
apiRouter.use('/reviews', ReviewsRouter);
apiRouter.use('/users/:id', RelationsRouter);
apiRouter.use('/users/:id', UserReviewsRouter);
apiRouter.use('/users', UsersRouter);
app.use('/v1', apiRouter);

// OpenAPI support
var options = {
    swaggerOptions: {
        displayOperationId: true,
        displayRequestDuration: true,
        operationsSorter: 'alpha',
        tagsSorter: 'alpha'
    }
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(OpenApiSpec, options));
app.get('/openapi.json', (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(OpenApiSpec);
});

// Error handlers
app.use(handleValidationErrors);
app.use(sendBackHttp4xxOr500);

// Redirect from homepage to docs
app.use('/$', redirectToDocs);

app.listen(8080, () => {
    console.log(`public-api started on port 8080!`);
});
