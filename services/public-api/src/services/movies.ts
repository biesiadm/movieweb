import { AxiosResponse } from 'axios';
import express from 'express';
import slugify from 'slugify';
import { Movie } from '../api/movies/api';
import { moviesApi } from '../config';
import { PublicMovie } from '../openapi';
import { buildSortingHandler, buildErrorPassthrough, errorIfIdNotValid, handlePagination } from '../middleware';

const router = express.Router();

/**
 * @swagger
 * /movies:
 *   get:
 *     operationId: getMovies
 *     summary: Retrieve a list of movies
 *     tags: [movies]
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/skip'
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [year, avg_rating, rating_count]
 *         required: false
 *         description: Sorting criteria.
 *       - $ref: '#/components/parameters/sort_dir'
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
 *         $ref: '#/components/responses/ValidationError'
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
 *     tags: [movies]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: Movie details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Movie"
 *       422:
 *         $ref: '#/components/responses/ValidationError'
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
