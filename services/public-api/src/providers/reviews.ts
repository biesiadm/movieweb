import { AxiosResponse } from 'axios';
import { Review } from '../api/reviews';
import { reviewsApi } from '../config';

const fetchReviews = async (ids: string[]): Promise<Review[]> => {
    // TODO(kantoniak): Validate UUID
    return Promise
        .all(ids.map(reviewsApi.readReviewApiReviewsReviewReviewIdGet))
        .then((responses: AxiosResponse<Review>[]) => {
            return responses
                .map(response => response.data)
                .map((review: Review) => {
                    if (review.comment === null) {
                        delete review.comment;
                    }
                    return review;
                });
        });
}

const fetchReview = async (id: string): Promise<Review> => {
    return (await fetchReviews([id]))[0];
}

const fetchNullableReviewByMovieUser = async (movie_id:string, user_id:string): Promise<Review | null> => {
    // TODO(kantoniak): Validate UUID
    try {
        const resp = await reviewsApi.readReviewByUserAndMovieApiReviewsMovieMovieIdUserUserIdGet(movie_id, user_id);
        let review = resp.data;
        if (review.comment === null) {
            delete review.comment;
        }
        return review;
    } catch (error) {
        if (error.response?.status && error.response.status == 404) {
            return null;
        } else {
            throw error;
        }
    }
}

export { fetchReview, fetchNullableReviewByMovieUser, fetchReviews };
