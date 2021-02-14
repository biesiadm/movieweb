import bodyParser from 'body-parser';
import express from 'express';
import asyncHandler from 'express-async-handler';
import { HTTPValidationError, ReviewCreate } from '../api/reviews/api';
import { PublicReview } from '../openapi';
import { buildSortingHandler, errorIfIdNotValid, handlePagination } from '../middleware';
import { requireToken } from '../token';
import { fetchUserById, fetchUsersById } from '../providers/users';
import { fetchMoviesById } from '../providers/movies';
import { createReview, deleteReview, fetchReviewById, fetchReviews, fetchReviewsByMovieId, fetchReviewsByUserId } from '../providers/reviews';

const router = express.Router();
const handleReviewSorting = buildSortingHandler(['created', 'rating']);

function errorIfNotUserToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const tokenOwnerId = req.token_payload?.sub;
    const userId = req.body.user_id;
    if (tokenOwnerId !== userId) {
        res.status(401).send();
        return;
    }
    return next();
}

const addOptionalMoviesToReviews = async (reviews: PublicReview[]): Promise<void> => {
    try {
        const movie_ids = reviews.map((r: PublicReview) => r.movie_id);
        const movies = await fetchMoviesById(movie_ids);
        movies.forEach((movie, i) => {
            reviews[i].movie = movie;
        });
    } catch (error) {
        // Don't do anything
    }
}

const addOptionalUsersToReviews = async (reviews: PublicReview[]): Promise<void> => {
    try {
        const user_ids = reviews.map((r: PublicReview) => r.user_id);
        const users = await fetchUsersById(user_ids);
        users.forEach((user, i) => {
            reviews[i].user = user;
        });
    } catch (error) {
        // Don't do anything
    }
}

/**
 * @swagger
 * components:
 *   responses:
 *     ReviewListResponse:
 *       description: List of reviews.
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *               required:
 *                 - reviews
 *                 - info
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *                 info:
 *                   $ref: '#/components/schemas/ListInfo'
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     operationId: getReviews
 *     summary: Retrieve a list of reviews
 *     tags: [reviews]
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/skip'
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created, rating]
 *         required: false
 *         description: Sorting criteria.
 *       - $ref: '#/components/parameters/sort_dir'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ReviewListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
router.get("/", handlePagination);
router.get("/", handleReviewSorting);
router.get("/", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Fetch all reviews
    const reviews = await fetchReviews(req.pagination!, req.sorting);
    await addOptionalMoviesToReviews(reviews);
    await addOptionalUsersToReviews(reviews);

    // TODO(biesiadm): Pass info from the service
    const responseBody = {
        movies: reviews,
        info: {
            count: reviews.length,
            totalCount: 16
        }
    };

    res.status(200).json(responseBody);
    return next();
}));

/**
 * @swagger
 * /reviews:
 *   post:
 *     operationId: addReview
 *     summary: Add review
 *     tags: [reviews]
 *     security:
 *       - JwtBearerAuth: []
 *       - JwtCookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReview'
 *     responses:
 *       200:
 *         description: Review created successfully.
 *         content:
 *           application/json:
 *            schema:
 *             $ref: '#/components/schemas/Review'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
router.post("/", requireToken);
router.post("/", bodyParser.json());
router.post("/", errorIfNotUserToken);
router.post("/", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Check if user exist
    const user_id: string = req.body?.user_id;
    await fetchUserById(user_id);

    // Check if movie exists
    const movie_id: string = req.body?.movie_id;
    await fetchMoviesById([movie_id]);

    // Validate rating
    const rating = Number(req.body?.rating);
    if (isNaN(rating) || !Number.isInteger(rating) || rating < 1 || 10 < rating) {
        throw <HTTPValidationError>{
            detail: [
                {
                    loc: ['body', 'rating'],
                    msg: 'Parameter rating not valid.',
                    type: 'param'
                }
            ]
        };
    }

    const review = createReview(<ReviewCreate>req.body);
    res.status(200).json(review);
    return next();
}));

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     operationId: removeReview
 *     summary: Remove review
 *     tags: [reviews]
 *     security:
 *       - JwtBearerAuth: []
 *       - JwtCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       204:
 *         description: Review removed successfully.
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
router.delete("/:id", errorIfIdNotValid);
router.delete("/:id", requireToken);
router.delete("/:id", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Check if user owns the review
    const user_id: string = req.token_payload!.sub;
    const review_id = req.params.id;
    const review: PublicReview = await fetchReviewById(review_id);

    if (review.user_id != user_id) {
        res.status(401).send();
        return;
    }

    // Remove review
    await deleteReview(review.id);
    res.status(204).send();
    return next();
}));

/**
 * @swagger
 * /movies/{id}/reviews:
 *   get:
 *     operationId: getMovieReviews
 *     summary: Retrieve a list of movie reviews
 *     tags: [movies, reviews]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/skip'
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created, rating]
 *         required: false
 *         description: Sorting criteria.
 *       - $ref: '#/components/parameters/sort_dir'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ReviewListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
const movieRouter = express.Router({ mergeParams: true });
movieRouter.get("/", errorIfIdNotValid);
movieRouter.get("/", handlePagination);
movieRouter.get("/", handleReviewSorting);
movieRouter.get("/", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Fetch all reviews
    const movie_id = req.params.id;
    const reviews = await fetchReviewsByMovieId(movie_id, req.pagination!, req.sorting);
    await addOptionalUsersToReviews(reviews);

    // TODO(biesiadm): Pass info from the service
    const responseBody = {
        movies: reviews,
        info: {
            count: reviews.length,
            totalCount: 16
        }
    };

    res.status(200).json(responseBody);
    return next();
}));

/**
 * @swagger
 * /users/{id}/reviews:
 *   get:
 *     operationId: getUserReviews
 *     summary: Retrieve a list of reviews by user
 *     tags: [users, reviews]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/skip'
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created, rating]
 *         required: false
 *         description: Sorting criteria.
 *       - $ref: '#/components/parameters/sort_dir'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ReviewListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
const userRouter = express.Router({ mergeParams: true });
userRouter.get("/", errorIfIdNotValid);
userRouter.get("/", handlePagination);
userRouter.get("/", handleReviewSorting);
userRouter.get("/", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Fetch all reviews
    const user_id = req.params.id;
    const reviews = await fetchReviewsByUserId(user_id, req.pagination!, req.sorting);
    await addOptionalMoviesToReviews(reviews);

    // TODO(biesiadm): Pass info from the service
    const responseBody = {
        movies: reviews,
        info: {
            count: reviews.length,
            totalCount: 16
        }
    };

    res.status(200).json(responseBody);
    return next();
}));

export { movieRouter as MovieReviewsRouter, userRouter as UserReviewsRouter };
export default router;
