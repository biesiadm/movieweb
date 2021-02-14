import { AxiosResponse } from 'axios';
import slugify from 'slugify';
import { Movie } from '../api/movies';
import { moviesApi } from '../config';
import { PublicMovie } from '../openapi';

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

const fetchMovies = async (skip?: number, limit?: number): Promise<PublicMovie[]> => {
    const resp = await moviesApi.readMoviesMoviesGet(skip, limit);
    return fillInGaps(resp.data);
}

const fetchMoviesById = async (ids: string[]): Promise<PublicMovie[]> => {
    // TODO(kantoniak): Validate UUIDs
    const movieResps = await Promise.all(ids.map(moviesApi.readMovieByIdMoviesMovieIdGet))
    const movies = movieResps.map((r: AxiosResponse<Movie>) => r.data);
    return fillInGaps(movies);
}

const fetchMovieById = async (id: string): Promise<PublicMovie> => {
    // TODO(kantoniak): Validate UUIDs
    return (await fetchMoviesById([id]))[0];
}

export { fetchMovies, fetchMovieById, fetchMoviesById };
