import { AxiosResponse } from 'axios';
import slugify from 'slugify';
import { Movie } from '../api/movies';
import * as cache from '../cache';
import { moviesApi } from '../config';
import { Pagination, Sorting } from '../middleware';
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

const fetchMovies = async (paging?: Pagination, sorting?: Sorting): Promise<PublicMovie[]> => {
    const skip = paging?.skip;
    const limit = paging?.limit;
    const sort = sorting?.by;
    const sortDir = <string>(sorting?.dir);

    // TODO(biesiadm): /api/movies?sort=year&sort_dir=desc      [zrobione po stronie serwisu]
    const resp = await moviesApi.readMoviesApiMoviesGet(skip, limit);
    const movies =  fillInGaps(resp.data);
    movies.forEach(cache.setMovie);
    return movies;
}

const fetchMoviesById = async (ids: string[]): Promise<PublicMovie[]> => {
    ids.forEach(throwOnInvalidUuid);

    // Fetch cached
    const cacheResp = await Promise.all(ids.map(cache.getMovie));
    const cachedMovies: PublicMovie[] = <PublicMovie[]>(cacheResp.filter(m => m != null));
    const cachedIds = cachedMovies.map(m => m.id);

    // Fetch others
    let movies: PublicMovie[] = [];
    const missingIds = ids.filter((id) => !cachedIds.includes(id));
    if (missingIds.length > 0) {
        const movieResps = await Promise.all(missingIds.map(moviesApi.readMovieByIdApiMoviesMovieIdGet))
        movies = fillInGaps(movieResps.map((r: AxiosResponse<Movie>) => r.data));
        movies.forEach(cache.setMovie);
    }

    // Merge and reorder
    movies = movies.concat(cachedMovies);
    let orderedMovies: PublicMovie[] = [];
    ids.forEach((id, i) => {
        orderedMovies[i] = <PublicMovie>movies.find(movie => movie.id == id);
    });

    return orderedMovies;
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
