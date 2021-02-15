import Redis from 'ioredis';
import { redisConfig } from './config';
import { PublicMovie } from './openapi';

const redis = new Redis(redisConfig);

const setMovie = async (movie: PublicMovie): Promise<void> => {
    try {
        const key = 'mov:' + movie.id;
        const value = JSON.stringify(movie);
        await redis.set(key, value);
    } catch (error) {
        // Do nothing
        console.log(error);
    }
}

const getMovie = async (id: string): Promise<PublicMovie | null> => {
    try {
        const key = 'mov:' + id;
        const resp = await redis.get(key);
        if (!resp) {
            return null;
        }
        return JSON.parse(resp) as PublicMovie;
    } catch (error) {
        console.log(error);
        return null;
    }
}

// TODO(kantoniak): Cache users

export { getMovie, setMovie };
