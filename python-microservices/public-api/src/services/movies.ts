import axios, { AxiosResponse } from 'axios';
import express from 'express';
import { axiosInstance } from './../config';
import { Movie, MoviesApiFactory } from './../api/movie/api';
import { Configuration } from './../api/movie/configuration';

const router = express.Router();
const api = MoviesApiFactory(
    new Configuration(),
    "http://movie_service:80",
    axiosInstance
);

router.get("", (req: express.Request, res: express.Response) => {
    api.readMoviesMoviesGet()
        .then((axiosResponse: AxiosResponse<Movie[]>) => {
            res.status(axiosResponse.status).send(axiosResponse.data);
        })
        .catch((err: unknown) => {
            console.log(err);
            res.status(500).send();
        });
});

export default router;
