import { AxiosResponse } from 'axios';
import express from 'express';
import slugify from 'slugify';
import { validate as validateUuid } from 'uuid';
import { axiosInstance } from './../config';
import { buildErrorPassthrough } from './../utils';
import { HTTPValidationError, Movie, MoviesApiFactory } from './../api/movies/api';
import { Configuration } from './../api/movies/configuration';

const router = express.Router();
const api = MoviesApiFactory(
    new Configuration(),
    "http://movies:80",
    axiosInstance
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: "object"
 *       required:
 *         - id
 *         - title
 *         - slug
 *         - poster_url
 *       properties:
 *         id:
 *           type: "string"
 *           format: "uuid"
 *         title:
 *           type: "string"
 *         slug:
 *           type: "string"
 *         poster_url:
 *           type: "string"
 *           format: "url"
 *         director:
 *           type: "string"
 *         year:
 *           type: "integer"
 *         country:
 *           type: "string"
 *         category:
 *           type: "string"
 */
interface PublicMovie extends Movie {

    /**
     *
     * @type {string}
     * @memberof Movie
     */
    slug: string;

    /**
     *
     * @type {string}
     * @memberof Movie
     */
    poster_url: string;
}

/**
 * @swagger
 * /movies:
 *   get:
 *     operationId: getMovies
 *     summary: Retrieve a list of movies
 *     responses:
 *       200:
 *         description: List of movies.
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: "#/components/schemas/Movie"
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HTTPValidationError"
 *
 */
router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    api.readMoviesMoviesGet()
        .then((axiosResponse: AxiosResponse<Movie[]>) => {
            axiosResponse.data = axiosResponse.data.map((movie: Movie) => {
                let result: Partial<PublicMovie> = movie;
                result.poster_url = 'https://fwcdn.pl/fpo/10/39/1039/7517880.3.jpg';
                result.slug = slugify(movie.title, {
                    lower: true,
                    strict: true,
                    locale: 'en'
                });
                return <PublicMovie>result;
            });
            return <AxiosResponse<PublicMovie[]>>axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicMovie[]>) => {
            res.status(axiosResponse.status).json(axiosResponse.data);
            return next();
        })
        .catch(buildErrorPassthrough([404, 422], res, next));
    return res;
});

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     operationId: getMovieById
 *     summary: Get movie by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Movie ID as UUID v4
 *     responses:
 *       200:
 *         description: Movie details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Movie"
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HTTPValidationError"
 *
 */
router.get("/:id", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // Parameter validation
    const id: string = req.params.id;
    if (!validateUuid(id)) {
        const err: HTTPValidationError = {
            detail: [
                {
                    loc: ["path", "id"],
                    msg: "Parameter {id} is not a valid UUID.",
                    type: "type_error.uuid"
                }
            ]
        };
        res.status(422).json(err);
        return next(err);
    }

    api.readMovieByIdMoviesMovieIdGet(id)
        .then((axiosResponse: AxiosResponse<Movie>) => {
            let newResponse: AxiosResponse<Partial<PublicMovie>> = axiosResponse;
            newResponse.data.poster_url = 'https://fwcdn.pl/fpo/10/39/1039/7517880.3.jpg';
            newResponse.data.slug = slugify(axiosResponse.data.title, {
                lower: true,
                strict: true,
                locale: 'en'
            });
            return <AxiosResponse<PublicMovie>>newResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicMovie>) => {
            res.status(axiosResponse.status).json(axiosResponse.data);
            return next();
        })
        .catch(buildErrorPassthrough([404, 422], res, next));
    return res;
});

export default router;
