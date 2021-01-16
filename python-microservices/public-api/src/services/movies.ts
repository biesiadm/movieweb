import axios, { AxiosResponse } from 'axios';
import express from 'express';
import slugify from 'slugify';
import { axiosInstance } from './../config';
import { Movie, MoviesApiFactory } from './../api/movie/api';
import { Configuration } from './../api/movie/configuration';

const router = express.Router();
const api = MoviesApiFactory(
    new Configuration(),
    "http://movie-service:80",
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
        .catch((reason: any) => {
            if (reason.response!.status === 422) {
                res.status(reason.response.status).json(reason.response.data);
                return next();
            } else {
                console.log(reason);
                reason.status(500).send();
                return next(reason);
            }
        });
    return res;
});

export default router;
