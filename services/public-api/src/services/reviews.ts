import bodyParser from 'body-parser';
import express from 'express';
import asyncHandler from 'express-async-handler';
import { validate as validateUuid } from 'uuid';
import { HTTPValidationError, ReviewCreate } from '../api/reviews/api';
import { PublicReview } from '../openapi';
import { buildSortingHandler, errorIfIdNotValid, handlePagination, Sorting, SortDir } from '../middleware';
import { requireToken } from '../token';
import { fetchUserById, fetchUsersById } from '../providers/users';
import { fetchMoviesById } from '../providers/movies';
import { createReview, deleteReview, fetchReviewById, fetchReviews, fetchReviewsByMovieId, fetchReviewsByUserId } from '../providers/reviews';
import { fetchFollowingIdsByUserId } from '../providers/relations';

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
 *       - in: query
 *         name: created_gte
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Limits to reviews created at given time or later.
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         required: false
 *         description: Limits to reviews created by users. Maximum 50 IDs.
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

    // Validate parameters
    let created_gte: Date | null = null;
    if (req.query.created_gte) {
        created_gte = new Date(req.params.created_gte);
        if (!created_gte || !created_gte.getTime || isNaN(created_gte.getTime())) {
            throw <HTTPValidationError>{
                detail: [
                    {
                        loc: ['query', 'created_gte'],
                        msg: 'Parameter created_gte not valid.',
                        type: 'param'
                    }
                ]
            };
        }
    }

    let user_ids = <string[] | null>req.query.user_id;
    if (user_ids) {
        if (typeof user_ids === 'string') {
            user_ids = [user_ids];
        }
        if (!Array.isArray(user_ids) ||
            user_ids.length > 50 ||
            !(user_ids.every((id: any) => (typeof id === 'string' && validateUuid(id))))) {
            throw <HTTPValidationError>{
                detail: [
                    {
                        loc: ['query', 'user_id'],
                        msg: 'Parameter user_id not valid.',
                        type: 'param'
                    }
                ]
            };
        }
    }

    // Fetch all reviews
    const body = await fetchReviews(req.pagination!, req.sorting, created_gte || undefined, user_ids || undefined);
    await addOptionalMoviesToReviews(body.reviews);
    await addOptionalUsersToReviews(body.reviews);

    res.status(200).json(body);
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

    const review = await createReview(<ReviewCreate>req.body);
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
    const body = await fetchReviewsByMovieId(movie_id, req.pagination!, req.sorting);
    await addOptionalUsersToReviews(body.reviews);
    res.status(200).json(body);
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
userRouter.get("/reviews", errorIfIdNotValid);
userRouter.get("/reviews", handlePagination);
userRouter.get("/reviews", handleReviewSorting);
userRouter.get("/reviews", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Fetch all reviews
    const user_id = req.params.id;
    const body = await fetchReviewsByUserId(user_id, req.pagination!, req.sorting);
    await addOptionalMoviesToReviews(body.reviews);
    res.status(200).json(body);
    return next();
}));

/**
 * @swagger
 * /users/{id}/review-feed:
 *   get:
 *     operationId: getUserReviewFeed
 *     summary: Retrieve a list of reviews by followed users
 *     tags: [users, reviews]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/skip'
 *       - in: query
 *         name: created_gte
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: Limits to reviews created at given time or later.
 *     responses:
 *       200:
 *         $ref: '#/components/responses/ReviewListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
userRouter.get("/review-feed", requireToken);
userRouter.get("/review-feed", errorIfIdNotValid);
userRouter.get("/review-feed", handlePagination);
userRouter.get("/review-feed", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // Check if asking for themselves
    const tokenOwnerId = req.token_payload?.sub;
    const userId = req.params.id;
    if (tokenOwnerId !== userId) {
        res.status(401).send();
        return;
    }

    // Validate parameters
    let created_gte: Date | null = null;
    if (req.query.created_gte) {
        created_gte = new Date(req.params.created_gte);
        if (!created_gte || !created_gte.getTime || isNaN(created_gte.getTime())) {
            throw <HTTPValidationError>{
                detail: [
                    {
                        loc: ['query', 'created_gte'],
                        msg: 'Parameter created_gte not valid.',
                        type: 'param'
                    }
                ]
            };
        }
    }

    // Fetch friend IDs
    const sorting: Sorting = {
        by: 'created',
        dir: SortDir.Descending
    }
    const friend_id_list = await fetchFollowingIdsByUserId(tokenOwnerId, req.pagination, sorting);
    const friend_ids = friend_id_list.strings;

    // Fetch all reviews
    const body = await fetchReviews(req.pagination!, undefined, created_gte || undefined, friend_ids);
    await addOptionalMoviesToReviews(body.reviews);
    await addOptionalUsersToReviews(body.reviews);
    res.status(200).json(body);
}));

export { movieRouter as MovieReviewsRouter, userRouter as UserReviewsRouter };
export default router;
