import Redis from 'ioredis';
import { redisConfig } from './config';
import { PublicMovie, PublicUser } from './openapi';

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

const setUser = async (user: PublicUser): Promise<void> => {
    try {
        const key = 'usr:' + user.id;
        const value = JSON.stringify(user);
        await redis.set(key, value);
    } catch (error) {
        // Do nothing
        console.log(error);
    }
}

const getUser = async (id: string): Promise<PublicUser | null> => {
    try {
        const key = 'usr:' + id;
        const resp = await redis.get(key);
        if (!resp) {
            return null;
        }
        return JSON.parse(resp) as PublicUser;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export { getMovie, setMovie, getUser, setUser };
