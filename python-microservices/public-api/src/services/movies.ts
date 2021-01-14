import axios, { AxiosResponse } from 'axios';
import express from 'express';
import { axiosInstance } from './../config';
import { Movie, MoviesApiFactory } from './../api/movie/api';
import { Configuration } from './../api/movie/configuration';

const router = express.Router();
const api = MoviesApiFactory(
    new Configuration(),
    "http://movie-service:80",
    axiosInstance
);

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: "object"
 *       properties:
 *         title:
 *           title: "Title"
 *           type: "string"
 *         director:
 *           title: "Director"
 *           type: "string"
 *         year:
 *           title: "Year"
 *           type: "integer"
 *         country:
 *           title: "Country"
 *           type: "string"
 *         category:
 *           title: "Category"
 *           type: "string"
 *         id:
 *           title: "Id"
 *           type: "string"
 *           format: "uuid"
 */

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Retrieve a list of movies
 *     responses:
 *       200:
 *         description: List of movies.
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: "#/components/schemas/Movie"
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HTTPValidationError"
 *
 */
router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    api.readMoviesMoviesGet()
        .then((axiosResponse: AxiosResponse<Movie[]>) => {
            res.status(axiosResponse.status).json(axiosResponse.data);
            return next();
        })
        .catch((reason: any) => {
            if (reason.response!.status === 422) {
                res.status(reason.response.status).json(reason.response.data);
                return next();
            } else {
                console.log(reason);
                reason.status(500).send();
                return next(reason);
            }
        });
    return res;
});

export default router;
