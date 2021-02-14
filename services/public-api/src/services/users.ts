import express from 'express';
import asyncHandler from 'express-async-handler';
import { errorIfIdNotValid, handlePagination } from '../middleware';
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
router.get("/", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {

    // TODO(biesiadm): Fetch users by login

    // Fetch all users
    const users = await fetchUsers(req.pagination!);

    // TODO(biesiadm): Pass info from the service
    const responseBody = {
        users: users,
        info: {
            count: users.length,
            totalCount: req.pagination!.skip + users.length
        }
    };

    res.status(200).json(responseBody);
    return next();
}));

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
router.get("/me", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user_id: string = req.token_payload!.sub!;
    const user = await fetchUserById(user_id);
    res.status(200).json(user);
    return next();
}));

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
router.get("/:id", asyncHandler(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user_id: string = req.params.id;
    const user = await fetchUserById(user_id);

    if (req.token_payload) {
        const follower_id = req.token_payload.sub;
        user.following = await isFollowing(follower_id, user_id);
    }

    res.status(200).json(user);
    next();
}));

export default router;
