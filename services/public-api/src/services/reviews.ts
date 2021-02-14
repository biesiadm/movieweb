import { AxiosResponse } from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import slugify from 'slugify';
import { HTTPValidationError, Review, ReviewCreate } from '../api/reviews/api';
import { moviesApi, reviewsApi, usersApi } from '../config';
import { PublicMovie, PublicUser } from '../openapi';
import { buildSortingHandler, buildErrorPassthrough, errorIfIdNotValid, handlePagination } from '../middleware';
import { Movie } from '../api/movies';
import { UserWeb } from '../api/users';
import { requireToken } from '../token';
import { fetchUserById } from '../providers/users';
import { fetchMovies } from '../providers/movies';
import { fetchReview } from '../providers/reviews';

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

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateReview:
 *       type: "object"
 *       required:
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
 *         comment:
 *           type: "string"
 *     Review:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateReview'
 *         -  type: "object"
 *            required:
 *              - created
 *            properties:
 *              created:
 *                type: "string"
 *                format: "date-time"
 *              movie:
 *                $ref: "#/components/schemas/Movie"
 *              user:
 *                $ref: "#/components/schemas/User"
 */
interface PublicReview extends Review {

    /**
     *
     * @type {PublicMovie}
     * @memberof PublicReview
     */
    movie?: PublicMovie;

    /**
     *
     * @type {PublicUser}
     * @memberof PublicReview
     */
    user?: PublicUser;
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
router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    reviewsApi.readAllReviewsApiReviewsReviewsGet(req.pagination!.skip, req.pagination!.limit,
        req.sorting?.by, req.sorting?.dir)
        .then((axiosResponse: AxiosResponse<Review[]>) => {
            axiosResponse.data = axiosResponse.data.map((review: Review) => <PublicReview>review);
            return <AxiosResponse<PublicReview[]>>axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            axiosResponse.data.forEach((review: PublicReview) => {
                review.created += 'Z'
            });
            return axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            const reviews: PublicReview[] = axiosResponse.data;
            return Promise
                .all(reviews
                    .map(r => r.movie_id)
                    .map(moviesApi.readMovieByIdMoviesMovieIdGet))
                    .then((responses: AxiosResponse<Movie>[]) => {
                        return responses.map(response => {
                            let movie: Partial<PublicMovie> = response.data;

                            // TODO(kantoniak): Get rid of slugify when we move slugs to service API
                            movie.slug = slugify(response.data.title, {
                                lower: true,
                                strict: true,
                                locale: 'en'
                            });
                            return <PublicMovie>movie;
                        });
                    })
                    .then((movies: PublicMovie[]) => {
                        movies.forEach((movie, i) => {
                            reviews[i].movie = movie;
                        });
                        return axiosResponse;
                    })
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            const reviews: PublicReview[] = axiosResponse.data;
            return Promise
                .all(reviews
                    .map(r => r.user_id)
                    .map(usersApi.readUserByIdApiUsersUserIdGet))
                    .then((responses: AxiosResponse<UserWeb>[]) => {
                        return responses.map(response => {
                            let user: Partial<PublicUser> = response.data;
                            return <PublicUser>user;
                        });
                    })
                    .then((users: PublicUser[]) => {
                        users.forEach((user, i) => {
                            reviews[i].user = user;
                        });
                        return axiosResponse;
                    })
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            // TODO(biesiadm): Pass info from the service
            const responseBody = {
                reviews: axiosResponse.data,
                info: {
                    count: axiosResponse.data.length,
                    totalCount: 4 * 16
                }
            };
            res.status(axiosResponse.status).json(responseBody);
            return next();
        })
        .catch(buildErrorPassthrough([422], res, next));
    return res;
});

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
router.post("/", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        // Check if user exist
        const user_id: string = req.body?.user_id;
        await fetchUserById(user_id);

        // Check if movie exists
        const movie_id: string = req.body?.movie_id;
        await fetchMovies([movie_id]);

        // Validate rating
        const rating = Number(req.body?.rating);
        if (isNaN(rating) || !Number.isInteger(rating) || rating < 1 || 10 < rating) {
            const err: HTTPValidationError = {
                detail: [
                    {
                        loc: ['body', 'rating'],
                        msg: 'Parameter rating not valid.',
                        type: 'param'
                    }
                ]
            };
            res.status(422).json(err).send();
            return;
        }

        // Add review
        const reqBody = <ReviewCreate>req.body;
        const reviewResp = await reviewsApi.addReviewApiReviewsNewPost(reqBody);

        // Fix missing GMT timestamp
        reviewResp.data.created += 'Z';

        res.status(200).json(reviewResp.data);
        return next();
    } catch (reason) {
        const handler = buildErrorPassthrough([400, 404, 422], res, next);
        handler(reason);
    }
});

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
router.delete("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        // Check if user owns the review
        const user_id: string = req.token_payload!.sub;
        const review_id = req.params.id;
        const review: Review = await fetchReview(review_id);

        if (review.user_id != user_id) {
            res.status(401).send();
            return;
        }

        // Remove review
        await reviewsApi.deleteReviewApiReviewsReviewReviewIdDeleteDelete(review_id);
        res.status(204).send();
        return next();
    } catch (reason) {
        const handler = buildErrorPassthrough([400, 404, 422], res, next);
        handler(reason);
    }
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
 *         $ref: '#/components/responses/ReviewListResponse'
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
    // TODO(biesiadm): Can we tame these OpenAPI operation names? It's just an extra declaration: https://fastapi.tiangolo.com/advanced/path-operation-advanced-configuration/#openapi-operationid
    const movie_id: string = req.params.id;
    reviewsApi.readMovieReviewsApiReviewsMovieMovieIdReviewsGet(movie_id, req.pagination!.skip, req.pagination!.limit,
        req.sorting?.by, req.sorting?.dir)
        .then((axiosResponse: AxiosResponse<Review[]>) => {
            axiosResponse.data = axiosResponse.data.map((review: Review) => <PublicReview>review);
            return <AxiosResponse<PublicReview[]>>axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            axiosResponse.data.forEach((review: PublicReview) => {
                review.created += 'Z'
            });
            return axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            const reviews: PublicReview[] = axiosResponse.data;
            return Promise
                .all(reviews
                    .map(r => r.user_id)
                    .map(usersApi.readUserByIdApiUsersUserIdGet))
                    .then((responses: AxiosResponse<UserWeb>[]) => {
                        return responses.map(response => {
                            let user: Partial<PublicUser> = response.data;
                            return <PublicUser>user;
                        });
                    })
                    .then((users: PublicUser[]) => {
                        users.forEach((user, i) => {
                            reviews[i].user = user;
                        });
                        return axiosResponse;
                    })
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            // TODO(biesiadm): Pass info from the service
            const responseBody = {
                reviews: axiosResponse.data,
                info: {
                    count: axiosResponse.data.length,
                    totalCount: 4 * 16
                }
            };
            res.status(axiosResponse.status).json(responseBody);
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
 *         $ref: '#/components/responses/ReviewListResponse'
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
    reviewsApi.readUserReviewsApiReviewsUserUserIdReviewsGet(user_id, req.pagination!.skip, req.pagination!.limit,
        req.sorting?.by, req.sorting?.dir)
        .then((axiosResponse: AxiosResponse<Review[]>) => {
            axiosResponse.data = axiosResponse.data.map((review: Review) => <PublicReview>review);
            return <AxiosResponse<PublicReview[]>>axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            axiosResponse.data.forEach((review: PublicReview) => {
                review.created += 'Z'
            });
            return axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            const reviews: PublicReview[] = axiosResponse.data;
            return Promise
                .all(reviews
                    .map(r => r.movie_id)
                    .map(moviesApi.readMovieByIdMoviesMovieIdGet))
                    .then((responses: AxiosResponse<Movie>[]) => {
                        return responses.map(response => {
                            let movie: Partial<PublicMovie> = response.data;

                            // TODO(kantoniak): Get rid of slugify when we move slugs to service API
                            movie.slug = slugify(response.data.title, {
                                lower: true,
                                strict: true,
                                locale: 'en'
                            });
                            return <PublicMovie>movie;
                        });
                    })
                    .then((movies: PublicMovie[]) => {
                        movies.forEach((movie, i) => {
                            reviews[i].movie = movie;
                        });
                        return axiosResponse;
                    })
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            // TODO(biesiadm): Pass info from the service
            const responseBody = {
                reviews: axiosResponse.data,
                info: {
                    count: axiosResponse.data.length,
                    totalCount: 4 * 16
                }
            };
            res.status(axiosResponse.status).json(responseBody);
            return next();
        })
        .catch(buildErrorPassthrough([422], res, next));
    return res;
});

export { movieRouter as MovieReviewsRouter, userRouter as UserReviewsRouter };
export default router;
