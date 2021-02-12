import { AxiosResponse } from 'axios';
import express from 'express';
import md5 from 'md5';
import { Relationship } from '../api/relationships';
import { UserWeb } from '../api/users';
import { relsApi, usersApi } from '../config';
import { PublicUser } from '../openapi';
import { buildErrorPassthrough, buildSortingHandler, errorIfIdNotValid, handlePagination } from '../middleware';

const router = express.Router({ mergeParams: true });
const handleSorting = buildSortingHandler(['created']);

const fetchUsers = async (user_ids: string[]): Promise<PublicUser[]> => {
    return Promise
        .all(user_ids.map(usersApi.readUserByIdApiUsersUserIdGet))
        .then((responses: AxiosResponse<UserWeb>[]) => {
            return responses.map(response => {
                let user: Partial<PublicUser> = response.data;
                user.login = response.data.id;
                // TODO(kantoniak): Get rid of md5 when we move slugs to service API
                // There should be an email istead of hash, but we don't have it in public-api.
                const gravatarHash = md5(user.login!.trim().toLowerCase());
                user.avatar_url = `https://www.gravatar.com/avatar/${gravatarHash}?d=identicon&s=128&r=g`;
                return <PublicUser>user;
            });
        });
}

/**
 * @swagger
 * /users/{id}/followers:
 *   get:
 *     operationId: getFollowers
 *     summary: Retrieve a list of followers
 *     tags: [users, relations]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/skip'
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created]
 *         required: false
 *         description: Sorting criteria.
 *       - $ref: '#/components/parameters/sort_dir'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
router.get("/followers", errorIfIdNotValid);
router.get("/followers", handlePagination);
router.get("/followers", handleSorting);
router.get("/followers", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        // TODO(biesiadm): Sorting
        const user_id: string = req.params.id;
        const relsResp = await relsApi.readUserFollowersApiRelationshipsFollowingUserIdGet(user_id);
        const follower_ids = relsResp.data.map((r: Relationship) => r.user_id);
        const users = await fetchUsers(follower_ids);

        // TODO(biesiadm): Pass info from the service
        const responseBody = {
            users: users,
            info: {
                count: users.length,
                totalCount: Math.max(2, users.length)
            }
        };
        res.status(relsResp.status).json(responseBody);
        return next();
    } catch (reason) {
        const handler = buildErrorPassthrough([400, 404, 422], res, next);
        handler(reason);
    }
});

/**
 * @swagger
 * /users/{id}/follows:
 *   get:
 *     operationId: getFollowedBy
 *     summary: Retrieve a list of followed users
 *     tags: [users, relations]
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/skip'
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created]
 *         required: false
 *         description: Sorting criteria.
 *       - $ref: '#/components/parameters/sort_dir'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/UserListResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
router.get("/follows", errorIfIdNotValid);
router.get("/follows", handlePagination);
router.get("/follows", handleSorting);
router.get("/follows", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        // TODO(biesiadm): Sorting
        const user_id: string = req.params.id;
        const relsResp = await relsApi.readFollowingByUserApiRelationshipsFollowedByUserIdGet(user_id);
        const followed_ids = relsResp.data.map((r: Relationship) => r.followed_user_id);
        const users = await fetchUsers(followed_ids);

        // TODO(biesiadm): Pass info from the service
        const responseBody = {
            users: users,
            info: {
                count: users.length,
                totalCount: Math.max(2, users.length)
            }
        };
        res.status(relsResp.status).json(responseBody);
        return next();
    } catch (reason) {
        const handler = buildErrorPassthrough([400, 404, 422], res, next);
        handler(reason);
    }
});

export default router;
