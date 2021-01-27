import { AxiosResponse } from 'axios';
import express from 'express';
import { Review } from '../api/reviews/api';
import { reviewsApi } from '../config';
import { buildSortingHandler, buildErrorPassthrough, errorIfIdNotValid, handlePagination } from '../middleware';

const router = express.Router();
const handleReviewSorting = buildSortingHandler(['created', 'rating']);

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: "object"
 *       required:
 *         - id
 *         - user_id
 *         - movie_id
 *         - rating
 *         - created
 *       properties:
 *         id:
 *           type: "string"
 *           format: "uuid"
 *         user_id:
 *           type: "string"
 *           format: "uuid"
 *         movie_id:
 *           type: "string"
 *           format: "uuid"
 *         rating:
 *           type: "integer"
 *           minimum: 1
 *           maximum: 10
 *         created:
 *           type: "string"
 *           format: "date-time"
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
 *         description: List of ratings.
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: "#/components/schemas/Review"
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
router.get("/", handlePagination);
router.get("/", handleReviewSorting);
router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // TODO(biesiadm): Handle /reviews/
    // TODO(biesiadm): Handle sorting in reviews API
    // TODO(kantoniak): Load reviews for all movies
    // This ID changes with every restart of reviews service
    const movie_id = '339e96d9-6e9c-4ad3-be67-976321a95a48';
    reviewsApi.readReviewsApiReviewsMovieMovieIdReviewsGet(movie_id, req.pagination!.skip, req.pagination!.limit)
        .then((axiosResponse: AxiosResponse<Review[]>) => {
            res.status(axiosResponse.status).json(axiosResponse.data);
            return next();
        })
        .catch(buildErrorPassthrough([422], res, next));
    return res;
});

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
 *         description: List of ratings.
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: "#/components/schemas/Review"
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
const movieRouter = express.Router({ mergeParams: true });
movieRouter.get("/", errorIfIdNotValid);
movieRouter.get("/", handlePagination);
movieRouter.get("/", handleReviewSorting);
movieRouter.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // TODO(biesiadm): Handle sorting in reviews API
    const movie_id: string = req.params.id;
    reviewsApi.readReviewsApiReviewsMovieMovieIdReviewsGet(movie_id, req.pagination!.skip, req.pagination!.limit)
        .then((axiosResponse: AxiosResponse<Review[]>) => {
            res.status(axiosResponse.status).json(axiosResponse.data);
            return next();
        })
        .catch(buildErrorPassthrough([422], res, next));
    return res;
});

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
 *         description: List of ratings.
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: "#/components/schemas/Review"
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
const userRouter = express.Router({ mergeParams: true });
userRouter.get("/", errorIfIdNotValid);
userRouter.get("/", handlePagination);
userRouter.get("/", handleReviewSorting);
userRouter.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // TODO(biesiadm): Handle sorting in reviews API
    const user_id: string = req.params.id;
    reviewsApi.readReviewsApiReviewsUserUserIdReviewsGet(user_id, req.pagination!.skip, req.pagination!.limit)
        .then((axiosResponse: AxiosResponse<Review[]>) => {
            res.status(axiosResponse.status).json(axiosResponse.data);
            return next();
        })
        .catch(buildErrorPassthrough([422], res, next));
    return res;
});

export { movieRouter as MovieReviewsRouter, userRouter as UserReviewsRouter };
export default router;
