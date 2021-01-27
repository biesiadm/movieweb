import { AxiosResponse } from 'axios';
import express from 'express';
import md5 from 'md5';
import slugify from 'slugify';
import { Review } from '../api/reviews/api';
import { moviesApi, reviewsApi, usersApi } from '../config';
import { PublicMovie, PublicUser } from '../openapi';
import { buildSortingHandler, buildErrorPassthrough, errorIfIdNotValid, handlePagination } from '../middleware';
import { Movie } from '../api/movies';
import { User } from '../api/users';

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
 *         comment:
 *           type: "string"
 *         created:
 *           type: "string"
 *           format: "date-time"
 *         movie:
 *           $ref: "#/components/schemas/Movie"
 *         user:
 *           $ref: "#/components/schemas/User"
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
    const movie_id = 'fab9d53d-d9ee-4f53-a9ec-32f0067682f2';
    reviewsApi.readReviewsApiReviewsMovieMovieIdReviewsGet(movie_id, req.pagination!.skip, req.pagination!.limit)
        .then((axiosResponse: AxiosResponse<Review[]>) => {
            axiosResponse.data = axiosResponse.data.map((review: Review) => <PublicReview>review);
            return <AxiosResponse<PublicReview[]>>axiosResponse;
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
            Promise
                .all(reviews
                    .map(r => r.user_id)
                    .map(usersApi.readUserByIdApiUsersUserIdGet))
                    .then((responses: AxiosResponse<User>[]) => {
                        return responses.map(response => {
                            let user: Partial<PublicUser> = response.data;
                            user.login = response.data.id;
                            // TODO(kantoniak): Get rid of md5 when we move slugs to service API
                            // There should be an email istead of hash, but we don't have it in public-api.
                            const gravatarHash = md5(user.login!.trim().toLowerCase());
                            user.avatar_url = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon&s=128&r=g`;
                            return <PublicUser>user;
                        });
                    })
                    .then((users: PublicUser[]) => {
                        users.forEach((user, i) => {
                            reviews[i].user = user;
                        });
                        res.status(axiosResponse.status).json(reviews);
                        next();
                    })
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
    // TODO(biesiadm): Can we tame these OpenAPI operation names? It's just an extra declaration: https://fastapi.tiangolo.com/advanced/path-operation-advanced-configuration/#openapi-operationid
    const movie_id: string = req.params.id;
    reviewsApi.readReviewsApiReviewsMovieMovieIdReviewsGet(movie_id, req.pagination!.skip, req.pagination!.limit)
        .then((axiosResponse: AxiosResponse<Review[]>) => {
            axiosResponse.data = axiosResponse.data.map((review: Review) => <PublicReview>review);
            return <AxiosResponse<PublicReview[]>>axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            const reviews: PublicReview[] = axiosResponse.data;
            Promise
                .all(reviews
                    .map(r => r.user_id)
                    .map(usersApi.readUserByIdApiUsersUserIdGet))
                    .then((responses: AxiosResponse<User>[]) => {
                        return responses.map(response => {
                            let user: Partial<PublicUser> = response.data;
                            user.login = response.data.id;
                            // TODO(kantoniak): Get rid of md5 when we move slugs to service API
                            // There should be an email istead of hash, but we don't have it in public-api.
                            const gravatarHash = md5(user.login!.trim().toLowerCase());
                            user.avatar_url = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon&s=128&r=g`;
                            return <PublicUser>user;
                        });
                    })
                    .then((users: PublicUser[]) => {
                        users.forEach((user, i) => {
                            reviews[i].user = user;
                        });
                        res.status(axiosResponse.status).json(reviews);
                        next();
                    })
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
            axiosResponse.data = axiosResponse.data.map((review: Review) => <PublicReview>review);
            return <AxiosResponse<PublicReview[]>>axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicReview[]>) => {
            const reviews: PublicReview[] = axiosResponse.data;
            Promise
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
                        res.status(axiosResponse.status).json(reviews);
                        next();
                    })
        })
        .catch(buildErrorPassthrough([422], res, next));
    return res;
});

export { movieRouter as MovieReviewsRouter, userRouter as UserReviewsRouter };
export default router;
