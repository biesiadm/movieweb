import express from 'express';
import asyncHandler from 'express-async-handler';
import { buildSortingHandler, errorIfIdNotValid, handlePagination } from '../middleware';
import { optionalToken } from '../token';
import { fetchNullableReviewByMovieIdUserId } from '../providers/reviews';
import { fetchMovieById, fetchMovies } from '../providers/movies';

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
        // TODO(biesiadm): /api/reviews/movies?sort=avg_rating&sort_dir=desc, zwraca listę [movie_id]       [zrobione po stronie reviews]
        // TODO(biesiadm): /api/reviews/movies?sort=rating_count&sort_dir=desc, zwraca listę [movie_id]     [zrobione po stronie reviews]
        // TODO(kantoniak): Fetch ids from movie service and then get movie details
    }

    // Fetch all movies
    const movies = await fetchMovies(req.pagination!);

    // TODO(biesiadm): Pass info from the service
    const responseBody = {
        movies: movies,
        info: {
            count: movies.length,
            totalCount: 16
        }
    };

    res.status(200).json(responseBody);
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
