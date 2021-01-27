import { AxiosResponse } from 'axios';
import express from 'express';
import slugify from 'slugify';
import { Movie } from '../api/movies/api';
import { moviesApi } from '../config';
import { buildSortingHandler, buildErrorPassthrough, errorIfIdNotValid, handlePagination } from '../middleware';

const router = express.Router();

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
 *         background_url:
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
     * @memberof PublicMovie
     */
    slug: string;
}

/**
 * @swagger
 * /movies:
 *   get:
 *     operationId: getMovies
 *     summary: Retrieve a list of movies
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           $ref: "#/components/schemas/ArgLimit"
 *         required: false
 *       - in: query
 *         name: skip
 *         schema:
 *           $ref: "#/components/schemas/ArgSkip"
 *         required: false
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [year, avg_rating, rating_count]
 *         required: false
 *         description: Sorting criteria.
 *       - in: query
 *         name: sort_dir
 *         schema:
 *           $ref: "#/components/schemas/ArgSortDir"
 *         required: false
 *         description: Sorting direction. Used only when "sort" is defined.
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
router.get("/", handlePagination);
router.get("/", buildSortingHandler(['year', 'avg_rating', 'rating_count']));
router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const ratingBasedSorts = ['avg_rating', 'rating_count'];
    if (req.sorting?.by && ratingBasedSorts.includes(req.sorting.by)) {
        // TODO(kantoniak): Fetch ids from movie service and then get movie details
    }

    moviesApi.readMoviesMoviesGet(req.pagination!.skip, req.pagination!.limit)
        .then((axiosResponse: AxiosResponse<Movie[]>) => {
            axiosResponse.data = axiosResponse.data.map((movie: Movie) => {
                let result: Partial<PublicMovie> = movie;
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
router.get("/:id", errorIfIdNotValid);
router.get("/:id", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const movie_id: string = req.params.id;
    moviesApi.readMovieByIdMoviesMovieIdGet(movie_id)
        .then((axiosResponse: AxiosResponse<Movie>) => {
            let newResponse: AxiosResponse<Partial<PublicMovie>> = axiosResponse;
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
