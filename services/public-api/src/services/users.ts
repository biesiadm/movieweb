import { AxiosResponse } from 'axios';
import express from 'express';
import { validate as validateUuid } from 'uuid';
import { axiosInstance } from '../config';
import { buildErrorPassthrough } from './../utils';
import { HTTPValidationError, User, UsersApiFactory } from '../api/users/api';
import { Configuration } from '../api/users/configuration';

const router = express.Router();
const api = UsersApiFactory(
    new Configuration(),
    "http://users:80",
    axiosInstance
);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: "object"
 *       required:
 *         - id
 *         - login
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: "string"
 *           format: "uuid"
 *         login:
 *           type: "string"
 *         name:
 *           type: "string"
 *         email:
 *           type: "string"
 *           format: "email"
 *         is_active:
 *           type: "boolean"
 *           default: true
 *         is_superuser:
 *           type: "boolean"
 *           default: false
 */
interface PublicUser extends User {

    /**
     *
     * @type {string}
     * @memberof PublicUser
     */
    login: string;
}

/**
 * @swagger
 * /users:
 *   get:
 *     operationId: getUsers
 *     summary: Retrieve a list of users
 *     parameters:
 *       - in: query
 *         name: login
 *         schema:
 *           type: "array"
 *           items:
 *             type: "string"
 *         required: false
 *         description: Limits results to provided login or logins.
 *     responses:
 *       200:
 *         description: List of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: "array"
 *               items:
 *                 $ref: "#/components/schemas/User"
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HTTPValidationError"
 */
router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // TODO: Pass logins to the service instead of handling them here. Temporarily
    // logins are treated as IDs.
    if (req.query.login !== undefined) {
        let loginList: any[] = [];
        if (Array.isArray(req.query.login)) {
            loginList = req.query.login;
        } else {
            loginList = [req.query.login];
        }

        Promise
            .all(loginList.map(api.readUserByIdApiUsersUserIdGet))
            .then((responses): User[] => {
                return responses.map((response) => response.data);
            })
            .then((users: User[]): void => {
                res.status(200).json(users);
                return next();
            })
            .catch(buildErrorPassthrough([401, 404, 422], res, next));
        return res;
    }

    // Fetch all users
    api.readUsersApiUsersGet()
        .then((axiosResponse: AxiosResponse<User[]>) => {
            axiosResponse.data = axiosResponse.data.map((movie: User) => {
                let result: Partial<PublicUser> = movie;
                result.login = result.id;
                return <PublicUser>result;
            });
            return <AxiosResponse<PublicUser[]>>axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicUser[]>) => {
            res.status(axiosResponse.status).json(axiosResponse.data);
            return next();
        })
        .catch(buildErrorPassthrough([401, 404, 422], res, next));
    return res;
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     operationId: getUserById
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: User ID as UUID v4
 *     responses:
 *       200:
 *         description: User details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       422:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/HTTPValidationError"
 *
 */
router.get("/:id", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // Parameter validation
    const id: string = req.params.id;
    if (!validateUuid(id)) {
        const err: HTTPValidationError = {
            detail: [
                {
                    loc: ["path", "id"],
                    msg: "Parameter {id} is not a valid UUID.",
                    type: "type_error.uuid"
                }
            ]
        };
        res.status(422).json(err);
        return next(err);
    }

    api.readUserByIdApiUsersUserIdGet(id)
        .then((axiosResponse: AxiosResponse<User>) => {
            let newResponse: AxiosResponse<Partial<PublicUser>> = axiosResponse;
            newResponse.data.login = newResponse.data.id;
            return <AxiosResponse<PublicUser>>newResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicUser>) => {
            res.status(axiosResponse.status).json(axiosResponse.data);
            return next();
        })
        .catch(buildErrorPassthrough([404, 422], res, next));
    return res;
});

export default router;
