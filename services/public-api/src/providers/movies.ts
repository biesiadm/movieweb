import { AxiosResponse } from 'axios';
import slugify from 'slugify';
import { Movie } from '../api/movies';
import { moviesApi } from '../config';
import { PublicMovie } from '../openapi';

const fetchMovies = async (movie_ids: string[]): Promise<PublicMovie[]> => {
    // TODO(kantoniak): Validate UUID
    return Promise
        .all(movie_ids.map(moviesApi.readMovieByIdMoviesMovieIdGet))
        .then((responses: AxiosResponse<Movie>[]) => {
            return responses.map(response => {
                let movie: Partial<PublicMovie> = response.data;
                movie.slug = slugify(movie.title!, {
                    lower: true,
                    strict: true,
                    locale: 'en'
                });
                return <PublicMovie>movie;
            });
        });
}

export { fetchMovies };
