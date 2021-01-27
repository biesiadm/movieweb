import { AxiosResponse } from 'axios';
import express from 'express';
import { validate as validateUuid } from 'uuid';
import { axiosInstance } from '../config';
import { buildErrorPassthrough } from '../utils';
import { HTTPValidationError, Review, ReviewsApiFactory } from '../api/reviews/api';
import { Configuration } from '../api/movies/configuration';
import { handlePagination, buildSortingHandler } from '../openapi';

const router = express.Router();
const api = ReviewsApiFactory(
    new Configuration(),
    "http://reviews:80",
    axiosInstance
);

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
 *           enum: [created, rating]
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
 *         description: List of ratings.
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: "#/components/schemas/Review"
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HTTPValidationError"
 *
 */
router.get("/", handlePagination);
router.get("/", buildSortingHandler(['created', 'rating']));
router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // TODO(biesiadm): Handle /reviews/
    // TODO(biesiadm): Handle sorting in reviews API
    // TODO(kantoniak): Load reviews for all movies
    // This ID changes with every restart of reviews service
    const movie_id = '339e96d9-6e9c-4ad3-be67-976321a95a48';
    api.readReviewsApiReviewsMovieMovieIdReviewsGet(movie_id, req.pagination!.skip, req.pagination!.limit)
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
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Movie ID as UUID v4
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
 *           enum: [created, rating]
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
 *         description: List of ratings.
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: "#/components/schemas/Review"
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HTTPValidationError"
 *
 */
const movieRouter = express.Router({ mergeParams: true });
movieRouter.get("/", handlePagination);
movieRouter.get("/", buildSortingHandler(['created', 'rating']));
movieRouter.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // Parameter validation
    // TODO(kantoniak): This is a common operation
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

    // TODO(biesiadm): Handle sorting in reviews API
    api.readReviewsApiReviewsMovieMovieIdReviewsGet(id, req.pagination!.skip, req.pagination!.limit)
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
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: User ID as UUID v4
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
 *           enum: [created, rating]
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
 *         description: List of ratings.
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: "#/components/schemas/Review"
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HTTPValidationError"
 *
 */
const userRouter = express.Router({ mergeParams: true });
userRouter.get("/", handlePagination);
userRouter.get("/", buildSortingHandler(['created', 'rating']));
userRouter.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // Parameter validation
    // TODO(kantoniak): This is a common operation
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

    // TODO(biesiadm): Handle sorting in reviews API
    api.readReviewsApiReviewsUserUserIdReviewsGet(id, req.pagination!.skip, req.pagination!.limit)
        .then((axiosResponse: AxiosResponse<Review[]>) => {
            res.status(axiosResponse.status).json(axiosResponse.data);
            return next();
        })
        .catch(buildErrorPassthrough([422], res, next));
    return res;
});

export { movieRouter as MovieReviewsRouter, userRouter as UserReviewsRouter };
export default router;
