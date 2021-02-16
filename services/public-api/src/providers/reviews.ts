import { AxiosResponse } from 'axios';
import { validate as validateUuid } from 'uuid';
import { Review, ReviewCreate } from '../api/reviews';
import { reviewsApi } from '../config';
import { Pagination, Sorting } from '../middleware';
import { PaginatedReviews, PublicReview } from '../openapi';
import { throwOnInvalidUuid } from '../utils';

const convertToPublic = (review: Review): PublicReview => {
    // Don't send null comments
    if (review.comment === null) {
        delete review.comment;
    }

    // Add GMT marker if missing
    if (review.created.slice(-1) !== 'Z') {
        review.created += 'Z';
    }

    return <PublicReview>review;
}

const createReview = async (create: ReviewCreate): Promise<PublicReview> => {
    const reviewResp = await reviewsApi.addReviewApiReviewsNewPost(create);
    return convertToPublic(reviewResp.data);
}

const deleteReview = async (id: string): Promise<void> => {
    throwOnInvalidUuid(id);
    await reviewsApi.deleteReviewApiReviewsReviewReviewIdDeleteDelete(id);
}

const fetchReviews = async (paging?: Pagination, sorting?: Sorting, createdGte?: Date, userIds?: string[]): Promise<PaginatedReviews> => {
    const skip = paging?.skip;
    const limit = paging?.limit;
    const sort = sorting?.by;
    const sortDir = <string>(sorting?.dir);
    const created_gte = createdGte?.toISOString();
    if (userIds) {
        userIds.forEach(throwOnInvalidUuid);
    }
    const resp = await reviewsApi.readAllReviewsApiReviewsReviewsGet(skip, limit, created_gte, userIds, sort, <any>sortDir);
    const reviews = resp.data.reviews.map(convertToPublic);
    return {
        reviews: reviews,
        info: resp.data.info
    }
}

const fetchReviewsById = async (ids: string[]): Promise<PublicReview[]> => {
    ids.forEach(throwOnInvalidUuid);
    const resps = await Promise.all(ids.map(reviewsApi.readReviewApiReviewsReviewReviewIdGet));
    const reviews = resps.map((r: AxiosResponse<Review>) => r.data);
    return reviews.map(convertToPublic);
}

const fetchReviewsByMovieId = async (movie_id: string, paging?: Pagination, sorting?: Sorting): Promise<PaginatedReviews> => {
    throwOnInvalidUuid(movie_id);

    const skip = paging?.skip;
    const limit = paging?.limit;
    const sort = sorting?.by;
    const sortDir = <string>(sorting?.dir);

    const resp = await reviewsApi.readMovieReviewsApiReviewsMovieMovieIdReviewsGet(movie_id, skip, limit, sort, sortDir);
    const reviews = resp.data.reviews.map(convertToPublic);
    return {
        reviews: reviews,
        info: resp.data.info
    }
}

const fetchReviewsByUserId = async (user_id: string, paging?: Pagination, sorting?: Sorting): Promise<PaginatedReviews> => {
    throwOnInvalidUuid(user_id);

    const skip = paging?.skip;
    const limit = paging?.limit;
    const sort = sorting?.by;
    const sortDir = <string>(sorting?.dir);

    const resp = await reviewsApi.readUserReviewsApiReviewsUserUserIdReviewsGet(user_id, skip, limit, sort, sortDir);
    const reviews = resp.data.reviews.map(convertToPublic);
    return {
        reviews: reviews,
        info: resp.data.info
    }
}

const fetchReviewById = async (id: string): Promise<Review> => {
    throwOnInvalidUuid(id);
    const review = (await fetchReviewsById([id]))[0];
    return convertToPublic(review);
}

const fetchNullableReviewByMovieIdUserId = async (movie_id: string, user_id: string): Promise<PublicReview | null> => {
    if (!validateUuid(movie_id) || !validateUuid(user_id)) {
        return null;
    }

    try {
        const resp = await reviewsApi.readReviewByUserAndMovieApiReviewsMovieMovieIdUserUserIdGet(movie_id, user_id);
        const review = resp.data;
        return convertToPublic(review);
    } catch (error) {
        if (error.response?.status && error.response.status == 404) {
            return null;
        } else {
            throw error;
        }
    }
}

export {
    createReview,
    deleteReview,
    fetchNullableReviewByMovieIdUserId,
    fetchReviewById,
    fetchReviews,
    fetchReviewsById,
    fetchReviewsByMovieId,
    fetchReviewsByUserId
};
