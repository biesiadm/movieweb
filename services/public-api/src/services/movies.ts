import express from 'express';
import asyncHandler from 'express-async-handler';
import { buildSortingHandler, errorIfIdNotValid, handlePagination } from '../middleware';
import { optionalToken } from '../token';
import { fetchNullableReviewByMovieIdUserId } from '../providers/reviews';
import { fetchMovieById, fetchMovies, fetchMoviesById } from '../providers/movies';
import { reviewsApi } from '../config';

const router = express.Router();

/**
 * @swagger
 * components:
 *   responses:
 *     MovieListResponse:
 *       description: List of movies.
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *               required:
 *                 - movies
 *                 - info
 *               properties:
 *                 movies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *                 info:
 *                   $ref: '#/components/schemas/ListInfo'
 */

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
 *         $ref: '#/components/responses/MovieListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
router.get("/", handlePagination);
router.get("/", buildSortingHandler(['year', 'avg_rating', 'rating_count']));
router.get("/", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const ratingBasedSorts = ['avg_rating', 'rating_count'];
    if (req.sorting?.by && ratingBasedSorts.includes(req.sorting.by)) {
        const skip = <number>req.pagination?.skip;
        const limit = req.pagination?.limit;
        const sort = req.sorting?.by;
        const sortDir = <string>(req.sorting?.dir);

        const idsResp = await reviewsApi.readMoviesApiReviewsMoviesGet(skip, limit, sort, sortDir);
        const ids: string[] = idsResp.data;
        const movies = await fetchMoviesById(ids);

        const responseBody = {
            movies: movies,
            info: {
                count: movies.length,
                totalCount: skip + movies.length
            }
        };

        res.status(200).json(responseBody);
        return next();
    }

    // Fetch all movies
    const body = await fetchMovies(req.pagination!, req.sorting);
    res.status(200).json(body);
    return next();
}));

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
router.get("/:id", optionalToken);
router.get("/:id", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const movie_id: string = req.params.id;
    const movie = await fetchMovieById(movie_id);

    if (req.token_payload) {
        const user_id = req.token_payload.sub;
        try {
            const review = await fetchNullableReviewByMovieIdUserId(movie.id, user_id);
            if (review) {
                movie.review = review;
            }
        } catch (error) {
            // Don't do anything
        }
    }

    res.status(200).json(movie);
    next();
}));

export default router;
