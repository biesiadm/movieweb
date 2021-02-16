import { AxiosResponse } from 'axios';
import { Movie, MovieCreate } from '../api/movies';
import * as cache from '../cache';
import { moviesApi } from '../config';
import { Pagination, Sorting } from '../middleware';
import { PaginatedMovies, PublicMovie } from '../openapi';
import { throwOnInvalidUuid } from '../utils';

const convertToPublic = (movie: Movie): PublicMovie => {
    return <PublicMovie>movie;
}

const createMovie = async (create: MovieCreate): Promise<PublicMovie> => {
    const resp = await moviesApi.createMovieApiMoviesAddPost(create);
    return convertToPublic(resp.data);
}

const fetchMovies = async (paging?: Pagination, sorting?: Sorting): Promise<PaginatedMovies> => {
    const skip = paging?.skip;
    const limit = paging?.limit;
    const sort = sorting?.by;
    const sortDir = <string>(sorting?.dir);

    const resp = await moviesApi.readMoviesApiMoviesGet(skip, limit, sort, sortDir);
    const movies =  resp.data.movies.map(convertToPublic);
    movies.forEach(cache.setMovie);

    return {
        movies: movies,
        info: resp.data.info
    }
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
        movies = movieResps.map((r: AxiosResponse<Movie>) => r.data).map(convertToPublic);
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
    createMovie,
    fetchMovieById,
    fetchMovies,
    fetchMoviesById
};
