import bodyParser from 'body-parser';
import express from 'express';
import asyncHandler from 'express-async-handler';
import validUrl from 'valid-url';
import { buildSortingHandler, errorIfIdNotValid, handlePagination } from '../middleware';
import { optionalToken, requireToken } from '../token';
import { fetchNullableReviewByMovieIdUserId } from '../providers/reviews';
import { createMovie, fetchMovieById, fetchMovies, fetchMoviesById } from '../providers/movies';
import { reviewsApi } from '../config';
import { HTTPValidationError, MovieCreate } from '../api/movies';

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
 * /movies:
 *   post:
 *     operationId: addMovie
 *     summary: Add movie
 *     tags: [movies]
 *     security:
 *       - JwtBearerAuth: []
 *       - JwtCookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMovie'
 *     responses:
 *       200:
 *         description: Movie created successfully.
 *         content:
 *           application/json:
 *            schema:
 *             $ref: '#/components/schemas/Movie'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
router.post("/", requireToken);
router.post("/", bodyParser.json());
router.post("/", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // Validate year
    const year = Number(req.body?.year);
    if (isNaN(year) || !Number.isInteger(year) || year < 1000) {
        throw <HTTPValidationError>{
            detail: [
                {
                    loc: ['body', 'year'],
                    msg: 'Parameter year not valid.',
                    type: 'param'
                }
            ]
        };
    }

    // Validate poster URL
    const poster_url = req.body?.poster_url;
    if (!validUrl.isUri(poster_url)) {
        throw <HTTPValidationError>{
            detail: [
                {
                    loc: ['body', 'poster_url'],
                    msg: 'Parameter poster_url not valid.',
                    type: 'param'
                }
            ]
        };
    }

    // Validate background URL
    const background_url = req.body?.background_url;
    if (background_url && !validUrl.isUri(background_url)) {
        throw <HTTPValidationError>{
            detail: [
                {
                    loc: ['body', 'background_url'],
                    msg: 'Parameter background_url not valid.',
                    type: 'param'
                }
            ]
        };
    }

    const movie = await createMovie(<MovieCreate>req.body);
    res.status(200).json(movie);
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
