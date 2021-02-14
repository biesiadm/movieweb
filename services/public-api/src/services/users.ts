import express from 'express';
import { buildErrorPassthrough, errorIfIdNotValid, handlePagination } from '../middleware';
import { optionalToken, requireToken } from '../token';
import { fetchUserById, fetchUsers } from '../providers/users';
import { isFollowing } from '../providers/relations';

const router = express.Router();

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
router.get("/", async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // TODO(biesiadm): Fetch users by login

    try {
        // Fetch all users
        const skip = req.pagination!.skip;
        const limit = req.pagination!.limit;
        const users = await fetchUsers(skip, limit);

        // TODO(biesiadm): Pass info from the service
        const responseBody = {
            users: users,
            info: {
                count: users.length,
                totalCount: skip + users.length
            }
        };

        res.status(200).json(responseBody);
        return next();
    } catch (reason) {
        const handler = buildErrorPassthrough([401, 404, 422], res, next);
        handler(reason);
    }
});

/**
 * @swagger
 * /users/me:
 *   get:
 *     operationId: getCurrentUser
 *     summary: Get current user using token
 *     tags: [users]
 *     security:
 *       - JwtBearerAuth: []
 *       - JwtCookieAuth: []
 *     responses:
 *       200:
 *         description: User details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 */
router.get("/me", requireToken);
router.get("/me", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user_id: string = req.token_payload!.sub!;
        const user = await fetchUserById(user_id);
        res.status(200).json(user);
        return next();
    } catch (reason) {
        const handler = buildErrorPassthrough([400, 404, 422], res, next);
        handler(reason);
    }
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
router.get("/:id", optionalToken);
router.get("/:id", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const user_id: string = req.params.id;
        const user = await fetchUserById(user_id);

        if (req.token_payload) {
            const follower_id = req.token_payload.sub;
            user.following = await isFollowing(follower_id, user_id);
        }

        res.status(200).json(user);
        next();
    } catch (reason) {
        const handler = buildErrorPassthrough([400, 404, 422], res, next);
        handler(reason);
    }
});

export default router;
