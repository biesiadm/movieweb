import { AxiosResponse } from 'axios';
import express from 'express';
import md5 from 'md5';
import { validate as validateUuid } from 'uuid';
import { axiosInstance } from '../config';
import { buildErrorPassthrough } from './../utils';
import { HTTPValidationError, User, UsersApiFactory } from '../api/users/api';
import { Configuration } from '../api/users/configuration';
import { handlePagination } from '../openapi';

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
 *         - avatar_url
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
 *         avatar_url:
 *           type: "string"
 *           format: "url"
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

    /**
     *
     * @type {string}
     * @memberof PublicUser
     */
    avatar_url: string;
}

/**
 * @swagger
 * /users:
 *   get:
 *     operationId: getUsers
 *     summary: Retrieve a list of users
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           $ref: "#/components/schemas/ArgLimit"
 *         required: false
 *       - in: query
 *         name: skip
 *         schema:
 *           $ref: "#/components/schemas/ArgSkip"
 *         required: false
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
router.get("/", handlePagination);
router.get("/", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // TODO: Pass logins to the service instead of handling them here. Temporarily
    // logins are treated as IDs.
    // TODO(kantoniak): Handle pagination in this case
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
    api.readUsersApiUsersGet(req.pagination!.skip, req.pagination!.limit)
        .then((axiosResponse: AxiosResponse<User[]>) => {
            axiosResponse.data = axiosResponse.data.map((movie: User) => {
                let result: Partial<PublicUser> = movie;
                result.login = result.id;

                // TODO: There should be an email istead of hash, but we don't have it in public-api.
                const gravatarHash = md5(result.login!.trim().toLowerCase());
                result.avatar_url = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon&s=128&r=g`;
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
