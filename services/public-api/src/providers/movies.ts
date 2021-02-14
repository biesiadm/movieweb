import { AxiosResponse } from 'axios';
import slugify from 'slugify';
import { Movie } from '../api/movies';
import { moviesApi } from '../config';
import { Pagination } from '../middleware';
import { PublicMovie } from '../openapi';
import { throwOnInvalidUuid } from '../utils';

const fillInGaps = (movies: Movie[]): PublicMovie[] => {
    return movies.map((m: Movie) => {
        let movie: Partial<PublicMovie> = m;

        // TODO(biesiadm): Move to movie service
        movie.slug = slugify(movie.title!, {
            lower: true,
            strict: true,
            locale: 'en'
        });
        return <PublicMovie>movie;
    });
}

const fetchMovies = async (paging?: Pagination): Promise<PublicMovie[]> => {
    const skip = paging?.skip;
    const limit = paging?.limit;
    const resp = await moviesApi.readMoviesMoviesGet(skip, limit);
    return fillInGaps(resp.data);
}

const fetchMoviesById = async (ids: string[]): Promise<PublicMovie[]> => {
    ids.forEach(throwOnInvalidUuid);
    const movieResps = await Promise.all(ids.map(moviesApi.readMovieByIdMoviesMovieIdGet))
    const movies = movieResps.map((r: AxiosResponse<Movie>) => r.data);
    return fillInGaps(movies);
}

const fetchMovieById = async (id: string): Promise<PublicMovie> => {
    throwOnInvalidUuid(id);
    return (await fetchMoviesById([id]))[0];
}

export {
    fetchMovieById,
    fetchMovies,
    fetchMoviesById
};
