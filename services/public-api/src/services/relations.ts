import express from 'express';
import asyncHandler from 'express-async-handler';
import { Relationship } from '../api/relations';
import { relsApi } from '../config';
import { buildIdHandler, buildSortingHandler, errorIfIdNotValid, handlePagination } from '../middleware';
import { requireToken } from '../token';
import { fetchUsersById } from '../providers/users';

const router = express.Router({ mergeParams: true });
const handleSorting = buildSortingHandler(['created']);

/**
 * @swagger
 * components:
 *   parameters:
 *     follower_id:
 *       in: path
 *       name: follower_id
 *       schema:
 *         type: string
 *         format: uuid
 *       required: true
 *       description: Follower ID as UUID v4
 */
const errorIfFollowerIdNotValid = buildIdHandler('follower_id');

function errorIfNotFollowersToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const tokenOwnerId = req.token_payload?.sub;
    const followerId = req.params.follower_id;
    if (tokenOwnerId !== followerId) {
        res.status(401).send();
        return;
    }
    return next();
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
router.get("/followers", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // TODO(biesiadm): Sorting
    const user_id: string = req.params.id;
    const relsResp = await relsApi.readUserFollowersApiRelationshipsFollowingUserIdGet(user_id);
    const follower_ids = relsResp.data.map((r: Relationship) => r.user_id);
    const users = await fetchUsersById(follower_ids);

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
}));

/**
 * @swagger
 * /users/{id}/followers/{follower_id}:
 *   post:
 *     operationId: addFollower
 *     summary: Add follower
 *     tags: [users, relations]
 *     security:
 *       - JwtBearerAuth: []
 *       - JwtCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *       - $ref: '#/components/parameters/follower_id'
 *     responses:
 *       204:
 *         description: Relation created successfully.
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
router.post("/followers/:follower_id", errorIfIdNotValid);
router.post("/followers/:follower_id", errorIfFollowerIdNotValid);
router.post("/followers/:follower_id", requireToken);
router.post("/followers/:follower_id", errorIfNotFollowersToken);
router.post("/followers/:follower_id", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Check if users exist
    const user_id: string = req.params.id;
    const follower_id: string = req.params.follower_id;
    await fetchUsersById([user_id, follower_id]);

    // Add follower
    await relsApi.addRelationshipApiRelationshipsFollowPost({
        followed_user_id: user_id,
        user_id: follower_id
    });

    res.status(204).send();
    return next();
}));

/**
 * @swagger
 * /users/{id}/followers/{follower_id}:
 *   delete:
 *     operationId: removeFollower
 *     summary: Remove follower
 *     tags: [users, relations]
 *     security:
 *       - JwtBearerAuth: []
 *       - JwtCookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/id'
 *       - $ref: '#/components/parameters/follower_id'
 *     responses:
 *       204:
 *         description: Relation removed successfully.
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *
 */
router.delete("/followers/:follower_id", errorIfIdNotValid);
router.delete("/followers/:follower_id", errorIfFollowerIdNotValid);
router.delete("/followers/:follower_id", requireToken);
router.delete("/followers/:follower_id", errorIfNotFollowersToken);
router.delete("/followers/:follower_id", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Remove follower
    const user_id: string = req.params.id;
    const follower_id: string = req.params.follower_id;
    await relsApi.deleteRelationshipApiRelationshipsUnfollowDelete({
        followed_user_id: user_id,
        user_id: follower_id
    });

    res.status(204).send();
    return next();
}));

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
router.get("/follows", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // TODO(biesiadm): Sorting
    const user_id: string = req.params.id;
    const relsResp = await relsApi.readFollowingByUserApiRelationshipsFollowedByUserIdGet(user_id);
    const followed_ids = relsResp.data.map((r: Relationship) => r.followed_user_id);
    const users = await fetchUsersById(followed_ids);

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
}));

export default router;
