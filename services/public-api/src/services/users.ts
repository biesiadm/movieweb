import { AxiosResponse } from 'axios';
import express from 'express';
import md5 from 'md5';
import { UserWeb } from '../api/users/api';
import { relsApi, usersApi } from '../config';
import { PublicUser } from '../openapi';
import { buildErrorPassthrough, errorIfIdNotValid, handlePagination } from '../middleware';

const router = express.Router();

/** Throws */
const isFollowing = async (follower_id: string, user_id: string): Promise<boolean> => {
    const followResp = await relsApi.checkRelationshipApiRelationshipsUsersUserIdFollowersFollowedUserIdGet(follower_id, user_id);
    return followResp.data;
}

/**
 * @swagger
 * components:
 *   responses:
 *     UserListResponse:
 *       description: List of users.
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *               required:
 *                 - users
 *                 - info
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 info:
 *                   $ref: '#/components/schemas/ListInfo'
 */

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
 *         $ref: '#/components/responses/UserListResponse'
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
            .then((responses): UserWeb[] => {
                return responses.map((response) => response.data);
            })
            .then((users: UserWeb[]): void => {
                res.status(200).json(users);
                return next();
            })
            .catch(buildErrorPassthrough([401, 404, 422], res, next));
        return res;
    }

    // Fetch all users
    usersApi.readUsersApiUsersGet(req.pagination!.skip, req.pagination!.limit)
        .then((axiosResponse: AxiosResponse<UserWeb[]>) => {
            axiosResponse.data = axiosResponse.data.map((movie: UserWeb) => {
                let result: Partial<PublicUser> = movie;
                result.login = result.id;

                // There should be an email istead of hash, but we don't have it in public-api.
                const gravatarHash = md5(result.login!.trim().toLowerCase());
                result.avatar_url = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon&s=512&r=g`;
                return <PublicUser>result;
            });
            return <AxiosResponse<PublicUser[]>>axiosResponse;
        })
        .then((axiosResponse: AxiosResponse<PublicUser[]>) => {
            // TODO(biesiadm): Pass info from the service
            const responseBody = {
                users: axiosResponse.data,
                info: {
                    count: axiosResponse.data.length,
                    totalCount: 5
                }
            };
            res.status(axiosResponse.status).json(responseBody);
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
 *     security:
 *       - {}
 *       - JwtBearerAuth: []
 *       - JwtCookieAuth: []
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
router.get("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user_id: string = req.params.id;
        const userResp = await usersApi.readUserByIdApiUsersUserIdGet(user_id);

        // TODO(biesiadm): Move to user API
        const partialUser = <Partial<PublicUser>>userResp.data;
        partialUser.login = partialUser.id;
        const gravatarHash = md5(partialUser.login!.trim().toLowerCase()); // Should use email, not login. We don't have emails in the public API, though.
        partialUser.avatar_url = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon&s=512&r=g`;

        const user = <PublicUser>partialUser;
        if (req.token_payload) {
            const follower_id = req.token_payload.sub;
            user.following = await isFollowing(follower_id, user_id);
        }

        res.status(userResp.status).json(user);
        next();
    } catch (reason) {
        const handler = buildErrorPassthrough([400, 404, 422], res, next);
        handler(reason);
    }
});

export default router;
