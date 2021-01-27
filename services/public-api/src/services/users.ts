import { AxiosResponse } from 'axios';
import express from 'express';
import md5 from 'md5';
import { User } from '../api/users/api';
import { usersApi } from '../config';
import { buildErrorPassthrough, errorIfIdNotValid, handlePagination } from '../middleware';

const router = express.Router();

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

    // TODO(biesiadm): Move to user API
    /**
     *
     * @type {string}
     * @memberof PublicUser
     */
    login: string;

    // TODO(biesiadm): Move to user API
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
 *     tags: [users]
 *     parameters:
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/skip'
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
 *         $ref: '#/components/responses/ValidationError'
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
            .all(loginList.map(usersApi.readUserByIdApiUsersUserIdGet))
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
    usersApi.readUsersApiUsersGet(req.pagination!.skip, req.pagination!.limit)
        .then((axiosResponse: AxiosResponse<User[]>) => {
            axiosResponse.data = axiosResponse.data.map((movie: User) => {
                let result: Partial<PublicUser> = movie;
                result.login = result.id;

                // There should be an email istead of hash, but we don't have it in public-api.
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
 *     tags: [users]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *     responses:
 *       200:
 *         description: User details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get("/:id", errorIfIdNotValid);
router.get("/:id", (req: express.Request, res: express.Response, next: express.NextFunction) => {

    const user_id: string = req.params.id;
    usersApi.readUserByIdApiUsersUserIdGet(user_id)
        .then((axiosResponse: AxiosResponse<User>) => {
            let newResponse: AxiosResponse<Partial<PublicUser>> = axiosResponse;
            newResponse.data.login = newResponse.data.id;

            // TODO: There should be an email istead of hash, but we don't have it in public-api.
            const gravatarHash = md5(newResponse.data.login!.trim().toLowerCase());
            newResponse.data.avatar_url = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon&s=128&r=g`;
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
