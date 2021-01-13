import express from 'express';
import cors from 'cors';
import OpenapiSpec from './openapi';
import MoviesRouter from './services/movies';
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(cors());

// Routes
app.use('/movies', MoviesRouter);

// OpenAPI support
app.use('/docs', swaggerUi.serve, swaggerUi.setup(OpenapiSpec));
app.get('/openapi.json', (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(OpenapiSpec);
});

app.listen(8080, () => {
    console.log(`public-api started on port 8080!`);
});
